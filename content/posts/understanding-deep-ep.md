---
title: "Understanding Deepseek's DeepEP Library"
date: 2025-09-04
draft: true
tags:
  - inference
  - notes
---

TLDR - DeepEP is a communication library written by Deepseek AI to optimize communication during Mixture-of-Experts training and inference. This blog dives into the inference side and how it looks in the SGLang code base.

Since SGLang released their blog post on serving Deepseek R1 with P/D Disaggregation and Wide Expert Parallelism on H100s, my team and I have been focused on ensuring that we support the SGLang team in getting the absolute best performance across all hardware. I've learned an incredible amount of throughout this process and wanted to start a small series where I explain some key pieces of technology used to power this innovation and how this tech manifests itself in the SGLang codebase itself.

People find it incredibly difficult to dive into inference library code. Hopefully this helps.

# Background: Mixture of Experts and All-to-All Communication

1. explain mixture of experts models
2. explain forward pass of a mixture of experts model
3. question - how do the tokens go through?

# MoE Communication Patterns

1. explain unique all to all communication and its challenge when it comes to optimized inference

- with moe, during the expert communication portion (gate -> tokens to experts called dispatch -> tokens back called combine) (dynamic all to all) you are sending small and frequent messages back and forth. a bunch of tiny irregular sends. there are ways to do this including the nccl all to all but that is primarily optimized for large bulk communication and it forces GPUs to sync (explain?)- because of this irregular communication pattern, nccl a2a is not quite performant enough out of the box.

TLDR - this sort of latency would greatly affect serving large MoE models

# DeepSeek's Soluution: DeepEP + NVSHMEM + IBGDA

A set of communication kernels written by Deepseek in order to solve this this problem. Deepseek does not use NCCL and instead uses I

### Understanding MoE Models

In a typical MoE setup, especially in the context of language models, each token or subword unit from the input sequence can be routed to one or more experts. The number of experts \( K \) is typically fixed
for all tokens, but each token can have different expert assignments based on its embedding and other factors (e.g., through a gating network).
