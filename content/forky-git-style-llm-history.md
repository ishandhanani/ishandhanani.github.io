---
title: Forky - Git-Style LLM Chat History
link: forky-git-style-handling-on-chat-history
published_date: 2024-08-11 22:18
meta_image: https://bear-images.sfo2.cdn.digitaloceanspaces.com/ishan-1723480139.webp
---

TLDR - Programmatically fork an LLM chat to have a tangential conversation then efficiently merge it back into the main conversation to preserve information.

## Table of Contents

1. [Motivation](#motivation)
2. [Tree Based Chat History](#understanding-chat-history)
3. [Future Enhancements](#future-enhancements)
4. [A New Approach to Chat History](#a-new-approach-to-chat-history)

# Motivation

This past week, Sonnet-3.5 and I found ourselves knee-deep in building a CLI for a new sort of cloud platform that I can't name just yet. Things were going great until we encountered some obscure Golang code-gen errors from the OpenAPI generator. Naturally, I started debugging with Sonnet in that same chat but as I started running out of available context, I decided to open a fresh chat and began working on the bug.

After solving the issue, I was left with an interesting dilemma. I now had two chats: the first was the main conversation, polluted by a half-finished debug session, and the other was a goldmine of potentially useful debugging insights. Two key questions arose:

1. Was there a way to combine these chats such that the main chat was aware of the debug session and its learnings?
2. Was there a way for me to save and/or share the debugging chat for future reference?

After some reflection and discussions with peers, I realized that a potential answer to the first question was an interaction model not typically applied to LLM conversations: Git. It would have been perfect if I could have branched off my main conversation into a separate thread, debugged for as long as needed, and then merged a shortened or summarized version of that conversation back into my main discussion. This realization led to an answer for the second question: What if I start treating my chat history as a file rather than a list and naturally unlocked Git-style interactions (more on this later)?

Because I had nothing better to do...enter [Forky](https://github.com/ishandhanani/forky) - a Git-style way of chatting with LLMs.

![forky](https://bear-images.sfo2.cdn.digitaloceanspaces.com/ishan-1723480139.webp)

# Understanding chat history

## A linear approach

Most implementations of conversation history with LLMs typically use a linear structure. While major model providers likely have their own sophisticated approaches, many simpler implementations append alternating `human` and `assistant` messages to a list. This approach is straightforward and intuitive, mirroring the back-and-forth nature of human conversation.

Here's a basic example:

```python
    def chat(self, user_message: str) -> str:
        # Add user message to history
        self.conversation_history.append({"role": "human", "content": user_message})

        # Get response from LLM
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=self.conversation_history
        )

        # Add assistant's response to history
        assistant_message = response.content[0].text
        self.conversation_history.append({"role": "assistant", "content": assistant_message})

        return assistant_message
```

This linear approach works well for simple conversations and has several advantages:

1. It's easy to implement and understand.
2. It preserves the full context of the conversation.
3. It's straightforward to display or process the conversation history.

However, this approach has limitations when dealing with more complex conversation structures:

1. It doesn't support branching conversations or exploring alternative paths.
2. Long conversations can quickly consume the context window of the LLM.
3. It's challenging to summarize or selectively include parts of the conversation history.

## A tree-based approach

In a tree-based approach, each message in the conversation is represented as a node in a tree structure. This allows for branching conversations, where a single point in the dialogue can spawn multiple different paths or threads. It's similar to how Git manages different branches of code development.

![Screenshot 2024-08-12 at 10](https://bear-images.sfo2.cdn.digitaloceanspaces.com/ishan-1723526054.png)

At the heart of Forky lies two key structures: `ConversationNode` and `ConversationTree`. Time to brush up on data structures...

### `ConversationNode`

`ConversationNode` represents a single message in our conversation. Think of it as analogous to a commit in Git - it captures a specific point in the conversation history.

```python
@dataclass
class ConversationNode:
    content: str
    role: str
    timestamp: datetime = field(default_factory=datetime.now)
    children: List['ConversationNode'] = field(default_factory=list)
    parent: Optional['ConversationNode'] = None
```

Note the only additions here from the linear structure are the `children` and `parent` attributes. These are required pointers.

### `ConversationTree`

The `ConversationTree` manages an entire conversation structure and provides methods for adding new messages, forking, and merging. Each tree has a root node which contains the system message

1. Adding messages: We add new messages by simply creating a new message node and setting the parent and current node pointers

```python
    def add_message(self, content: str, role: str) -> None:
        new_node = ConversationNode(content=content, role=role)
        self.current_node.children.append(new_node)
        new_node.parent = self.current_node
        self.current_node = new_node
```

2. Forking: Analogous to branching in Git, this method adds a `<FORK>` node, which is a marker for a new conversation branch. It allows for multiple children and enables parallel conversation across two chats

```python
    def fork(self) -> None:
        fork_node = ConversationNode(content="<FORK>", role="system")
        self.current_node.children.append(fork_node)
        fork_node.parent = self.current_node
        self.current_node = fork_node
```

3. Merging: The merge involves a couple different steps. We first traverse up the tree to find the `<FORK>` node and then summarize the forked conversation with a `merge_commit` which is analogous to a commit message. We then add a pair of nodes: a human node containing the merge prompt and an assistant message containing the summary.

```python
    def merge(self, merge_prompt: str) -> None:
        # Find the fork node
        fork_node = self.current_node
        while fork_node.content != "<FORK>" and fork_node.parent:
            fork_node = fork_node.parent
        if fork_node.content != "<FORK>":
            raise ValueError("No fork found to merge")

        # Summarize the forked conversation
        summary = self._summarize_fork(fork_node, merge_prompt)

        # Move back to the main conversation and add the summary
        parent_of_fork = fork_node.parent
        self.current_node = parent_of_fork
        self.add_message(merge_prompt, "user")
        self.add_message(f"Here's a summary of another conversation branch: {summary}", "assistant")

        # Remove the fork and its entire subtree
        parent_of_fork.children.remove(fork_node)
```

# Future Enhancements

There's a good bit of features that I think should be added to forky. First and foremost is support for more git features. A couple include

1. Cherry-picking: It would be great if we could select specific messages from a branch and apply them to another especially when a side conversation produces some extremely valuable insight
2. Stashing: Think of this as temporarily saving a line of thought. This could be used as a quick scratch pad for the LLM without derailing the current discussion
3. Merge types: Currently summarization is akin to a squash merge. It would be great to experiment with different types of merge prompts and other ways to moving information to the main branch

# A New Approach to Chat History

Remember this?

> What if I start treating my chat history as a file rather than a list and naturally unlocked Git-style interactions (more on this later)?

A lot of the implementation that I had to do to enable Git-style commands was because chats are not currently treated as files (i.e., there is no standard spec or export format). The closest examples are sharing a ChatGPT link with someone or a Perplexity Page. What if there was a spec that encapsulated an LLM conversation history and allowed people to start sharing and forking new conversations from someone's existing history?

This idea opens up a world of possibilities

1. **Standardized Chat Format**: Developing a universal format for LLM conversations could enable interoperability between different AI platforms and tools.
2. **Version Control for Conversations**: Just as Git revolutionized code version control, a similar system for conversations could transform how we manage and collaborate on complex dialogues.
3. **Multi-agent interactions**: A mixture of agents system with different expertise or perspectives could work in parallel and continuously resolve diffs and review each others work.

Stay tuned. @tmc and I are cooking. [Related tweet :)](https://twitter.com/traviscline/status/1822467537571139732)
