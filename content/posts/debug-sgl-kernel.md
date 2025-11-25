---
title: "Understanding linking and .so's during debugging"
date: 2025-10-15
tags:
  - debug
  - sglang
  - gb300
draft: true
---

TLDR - Short debug session figuring out why SGL kernel wouldn't load on GB300. Turns out it was a GLIBCXX version mismatch from building on Ubuntu 24.04 but running on 22.04.

## Initial Error

After getting onto a GB300 node - wow btw

```bash
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.82.07              Driver Version: 580.82.07      CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GB300                   On  |   00000008:06:00.0 Off |                    0 |
| N/A   28C    P0            172W / 1400W |       0MiB / 284208MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   1  NVIDIA GB300                   On  |   00000009:06:00.0 Off |                    0 |
| N/A   29C    P0            172W / 1400W |       0MiB / 284208MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   2  NVIDIA GB300                   On  |   00000018:06:00.0 Off |                    0 |
| N/A   29C    P0            171W / 1400W |       0MiB / 284208MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   3  NVIDIA GB300                   On  |   00000019:06:00.0 Off |                    0 |
| N/A   28C    P0            175W / 1400W |       0MiB / 284208MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
```

I tried to get SGL kernel to work since I had done a bunch of stuff to compile it for sm103. My initial debug command:

```bash
CUDA_LAUNCH_BLOCKING=1 python3 -c "
import logging
logging.basicConfig(level=logging.DEBUG)
import sgl_kernel
" 2>&1 | tail -50
```

Which gives me:

```bash
DEBUG:sgl_kernel:[sgl_kernel] sgl_kernel directory: /usr/local/lib/python3.12/dist-packages/sgl_kernel
DEBUG:sgl_kernel:[sgl_kernel] Attempting to load SM103 (precise math for compatibility)
DEBUG:sgl_kernel:[sgl_kernel] Looking for library matching pattern: /usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.*
DEBUG:sgl_kernel:[sgl_kernel] Found files: ['/usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.abi3.so']
DEBUG:sgl_kernel:[sgl_kernel] ✗ Failed to load from /usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.abi3.so: ImportError: /usr/lib/aarch64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.32' not found (required by /usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.abi3.so)
DEBUG:sgl_kernel:[sgl_kernel] Attempting fallback: looking for pattern /usr/local/lib/python3.12/dist-packages/sgl_kernel/common_ops.*
DEBUG:sgl_kernel:[sgl_kernel] Found fallback files: []
DEBUG:sgl_kernel:[sgl_kernel] Prioritized fallback files: []
DEBUG:sgl_kernel:[sgl_kernel] ✗ Fallback library not found matching pattern: /usr/local/lib/python3.12/dist-packages/sgl_kernel/common_ops.*
DEBUG:sgl_kernel:[sgl_kernel] Final attempt: trying standard Python import 'common_ops'
DEBUG:sgl_kernel:[sgl_kernel] ✗ Standard Python import failed: No module named 'common_ops'
DEBUG:sgl_kernel:
[sgl_kernel] CRITICAL: Could not load any common_ops library!

Attempted locations:
1. Architecture-specific pattern: /usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.* - found files: ['/usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.abi3.so']
2. Fallback pattern: /usr/local/lib/python3.12/dist-packages/sgl_kernel/common_ops.* - found files: []
3. Standard Python import: common_ops - failed

GPU Info:
- Compute capability: 103
- Expected variant: SM103 (precise math for compatibility)

Please ensure sgl_kernel is properly installed with:
pip install --upgrade sgl_kernel

Traceback (most recent call last):
  File "<string>", line 4, in <module>
  File "/usr/local/lib/python3.12/dist-packages/sgl_kernel/__init__.py", line 184, in <module>
    common_ops = _load_architecture_specific_ops()
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.12/dist-packages/sgl_kernel/__init__.py", line 179, in _load_architecture_specific_ops
    raise ImportError(error_msg)
ImportError:
[sgl_kernel] CRITICAL: Could not load any common_ops library!

GPU Info:
- Compute capability: 103
- Expected variant: SM103 (precise math for compatibility)
```

## Debugging

Two things to check here. First, is the kernel even compiled for sm103? This can be done by running a command called `cuobjdump`. `

```bash
cuobjdump -lelf /usr/local/lib/python3.12/dist-packages/sgl_kernel/sm100/common_ops.abi3.so | grep sm_103
```

```bash
ELF file    7: common_ops.abi3.7.sm_103a.cubin
ELF file   17: common_ops.abi3.17.sm_103a.cubin
ELF file   27: common_ops.abi3.27.sm_103a.cubin
ELF file   37: common_ops.abi3.37.sm_103a.cubin
...
```

Yes, sm103 cubins are present. So the real issue is the GLIBCXX error:

```
ImportError: /usr/lib/aarch64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.32' not found
```

I hadn't seen this before so I checked what GLIBCXX versions were available on the system by running `strings` on the libstdc++.so.6 file:

```bash
strings /usr/lib/aarch64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
```

```bash
GLIBCXX_3.4
GLIBCXX_3.4.1
...
GLIBCXX_3.4.29
GLIBCXX_3.4.30
GLIBCXX_DEBUG_MESSAGE_LENGTH
```

Only goes up to `GLIBCXX_3.4.30`, but the kernel needs `GLIBCXX_3.4.32`.

## Root Cause

`GLIBCXX` refers to versioned symbols in `libstdc++` (GNU Standard C++ Library). The available symbols are tightly coupled to the OS release:

- **Ubuntu 22.04** ships with GCC 11 → provides up to `GLIBCXX_3.4.30`
- **Ubuntu 24.04** ships with GCC 13 → provides `GLIBCXX_3.4.32` and newer

Binaries built on 24.04 expect newer symbols that don't exist on 22.04. You can't just swap the shared libraries between OS versions.

This made sense - I had run `make build` on a 24.04 machine instead of using the build.sh script which targets 22.04.

## Fix

Rebuilt on Ubuntu 22.04 and it worked.
