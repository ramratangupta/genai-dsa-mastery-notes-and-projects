# 🌿 **1. What are Embeddings?**

Embeddings are **vectors (lists of numbers)** that capture the **meaning** of text.

Examples:

- “yoga” and “meditation” → vectors close together
- “banana” and “server” → far apart

They let AI understand:

- similarity
- context
- relationships
- meaning

---

## 🧠 **2. Why Embeddings Matter (Your Project Use Case)**

In the **Tender Summary Generator**, you will:

- chunk the tender
- map each chunk → embedding
- search for similar chunks
- pick the most relevant ones
- feed them to the LLM for the answer

Embeddings make search “semantic,” not keyword-based.

---

## ⚙️ \*_3. How Embeddings Work_

When text becomes a vector:

```
“This is a tender document”
↓
[0.013, -0.54, 0.92, 0.11, …]
```

Similar text → similar vector
Different text → different vector

This is how the model “understands” meaning.

---

## 🧪 **4. Cosine Similarity**

Cosine similarity tells “how similar two vectors are.”

Range:

- **1.0** → identical
- **0.8** → similar
- **0.5** → somewhat related
- **0.0** → not related
- **-1.0** → opposite (rare in text)

For your tender project, it needs to be **threshold 0.7+** for good chunks

---

### How embeddings + similarity help RAG

- An **embedding** is a numerical vector representation of a text (sentence, paragraph, document) that captures its semantic meaning.
- **Similarity** typically means measuring how “close” two embeddings are (e.g., cosine similarity) so you can decide which pieces of text are semantically relevant.
- A **vector database** or vector store is used to store many embeddings and efficiently search for those nearest to a query embedding.

---

#### How embeddings + similarity help in a RAG workflow

Here’s a typical RAG pipeline, with where embeddings/similarity come in:

1. **Indexing / Preparation**

   - You take your external knowledge base (documents, FAQs, manuals, whatever your system needs)
   - You chunk the documents (e.g., paragraphs or sections) and compute embeddings for each chunk using an embedding model.
   - Store those embeddings (along with metadata/reference to the original text) in a vector store.

2. **Querying / Retrieval**

   - User asks a question (or the system has a prompt). That question is converted into an embedding.
   - In the vector store you find chunks whose embeddings are _similar_ to the query embedding (i.e., high similarity).
   - These retrieved chunks are likely to be semantically relevant to the question. This is much stronger than purely keyword-matching because embeddings capture meaning, not just word overlap.

3. **Augmentation / Generation**

   - You take those retrieved relevant text chunks and feed them (along with the user query) into the generative model (LLM).
   - The LLM uses this external knowledge as _context_ so it can generate an answer that is grounded in the retrieved facts, rather than relying solely on its internal training.
   - Because you retrieved data based on semantic similarity, the risk of pulling irrelevant or off-topic chunks is reduced, improving relevance and accuracy.

---

#### Why this matters (the benefits)

---

- It helps mitigate the problem where a large language model (LLM) lacks up-to-date or domain-specific knowledge. With RAG + embeddings, you can plug in fresh or private data without retraining the whole model.
- It enables more accurate retrieval of relevant content because embeddings allow semantic matches (e.g., “secure my data in transit” might match a document about “encrypting dataQE during transfer” even if exact keywords differ).
- It can improve trust/grounding: since you’re retrieving from a controlled knowledge base and using that to inform generation, you can more easily add citations or references.

---

#### Key considerations / challenges

- The choice of embedding model matters: some are better suited for retrieval tasks than others.
- Chunking strategy: how you split documents for embedding affects retrieval relevance. If chunks are too large you might dilute specificity; too small and you might lose context.
- Similarity threshold and retrieval ranking: you must ensure you’re retrieving sufficiently relevant chunks (and avoid retrieving irrelevant ones) because feeding in garbage context will hurt generation. This retrieval step is critical.
- Even with RAG, the LLM can still hallucinate or make mistakes, so the retrieved data + prompt engineering + generation all need careful design.

---

### How to pick good chunks

✅ What makes a “good” chunk

1. **Self-contained meaning** – A chunk should be understandable and useful on its own (or with minimal context) rather than being just a random half-sentence. As one guide states: “If the chunk of text makes sense without the surrounding context … then it will make sense to the language model as well.”
2. **Size fits model context / token limits** – Make sure the chunk isn’t too large (so it exceeds the embedding or retrieval model’s window) or too small (so it loses meaning). For example: “The trick lies in finding chunks that are big enough to contain meaningful information, while small enough to enable performant applications and low latency responses.”
3. **Logical boundary alignment** – Prefer splitting at natural boundaries (paragraphs, section headings, logical breaks) rather than arbitrarily mid-sentence or mid-idea. This preserves coherence.
4. **Minimal redundant overlap / poor context** – While some overlap helps (to capture content that spans boundaries), excessive overlap or splitting irrelevant portions harms precision and introduces noise.
5. **Relevant content density** – The chunk should include information likely to answer or relate to future queries, not filler or irrelevant details. Good chunks improve retrieval precision.

---

#### ⚠️ Common pitfalls

- Chunks cut **mid-sentence** or mid-thought → users or LLM retrieve a fragment that lacks clarity.
- Chunks are **too large**, containing multiple topics, so retrieval may bring in extraneous context and reduce relevance. For example, experiments found smaller chunks help “factoid” queries, larger for more analytical ones, but you need to balance.
- Chunks are **too small**, so each contains too little context — retrieval may retrieve many but none contain full answer.
- Ignoring **document structure** (sections/headings) and splitting purely by fixed characters/tokens may result in semantically incoherent boundaries.
- Poor overlap strategy (none or too much) — causing missing content or lots of duplicate/redundant retrieval.

---

#### 🔧 Practical how-to: picking & implementing chunks

Here’s a step-by-step practical workflow:

1. **Load document / data source** — whether PDF, web page, manual, etc.
2. **Decide chunking strategy** based on your content:

   - Fixed-size token or character chunks (simple, but risk splitting meaning).
   - Sentence- or paragraph-based (better coherence).
   - Structure-based (split by sections/headings) for richly structured docs.
   - Semantic chunking (use embedding/algorithm to detect logical breakpoints) for best accuracy but more complex. ([masteringllm.medium.com][5])

3. **Set chunk size & overlap** — Example: 256-512 tokens for smaller factual corpora; for complex analytics maybe up to 1024 tokens or page-level chunks. Experiments suggest token-based with ~15% overlap works well in many cases.
4. **Ensure boundary alignment** — avoid cutting in middle of a sentence; ideally split at paragraph/heading. If fixed-size, allow an overlap region or adjust to nearest boundary.
5. **Enhance metadata** — tag each chunk with source info (document ID, section heading, page, etc). This helps with attribution, filtering and relevance later.
6. **Test retrieval + generation cycle** — after chunking and embedding, run sample queries. Check: are retrieved chunks coherent? Do they give the model good context? If not, adjust chunk size or strategy.
7. **Iterate & monitor** — measure metrics like retrieval precision, generation quality (e.g., factual accuracy, coherence). Chunking strategy may need fine-tuning for your domain or type of queries.

---

#### Why chunk size matters (too large = irrelevant, too small = fragmented)

Here are beginner-friendly bullet points on **why chunk size matters** in a RAG (Retrieval-Augmented Generation) system, and _what can go wrong_ if chunks are either too large or too small:

---

#### 🎯 Why chunk size matters

- The chunk size influences how well the system can match a query to the right piece of content: you embed each chunk and compare to a query embedding.
- A chunk needs to contain enough context to answer a user’s question, but not so much extra content that irrelevant information dilutes the match.
- It affects performance: large chunks mean more tokens to process, slower embedding & retrieval; small chunks mean more chunks to store and search through.
- A good chunk size helps strike a balance between **precision** (getting the right info) and **recall** (having enough info so you don’t miss the answer).

---

#### ⚠️ What happens if chunks are **too small**

- The chunk may contain only part of the answer or fragment the idea, so when retrieved, it lacks sufficient context to generate a good answer.
- You’ll have lots of chunks, which may increase the search space and make retrieval less efficient or more noisy.
- For questions that require understanding across a paragraph or section, very small chunks may force the model to pull together disparate pieces, increasing risk of missing links.

---

#### ⚠️ What happens if chunks are **too large**

- The chunk may include lots of irrelevant information alongside the relevant part. This means the embedding becomes “blurry” in terms of what the chunk is about, lowering the similarity precision.
- The retrieval step might select a chunk because part of it matches, but much of it is irrelevant, making the generation step harder (model has to sift through noise).
- Larger chunks cost more to embed, store and process; they may even exceed token limits of models or slow down response time.

Here’s an easy-to-understand explanation of **Cosine similarity** (for beginners) — what it is, how it works, and why it’s useful.

---

### ✅ What is cosine similarity

- Imagine two arrows (vectors) coming out of the same point, each pointing in some direction. Cosine similarity measures **how closely those arrows point in the same direction**.
- In the context of text, images or “embeddings” (numerical representations of data) we turn each item into a vector and compare them. If two items are “about the same thing,” their vectors will point in similar directions (small angle between them) → high cosine similarity.

---

#### 🎯 What the values mean

- Value **= 1**: Vectors point in exactly the same direction → most similar.
- Value **= 0**: Vectors at right angles (90°) → no meaningful similarity in direction.
- Value **= -1**: Vectors point in exactly opposite directions → completely opposite in that space (this is possible when vectors can have negative components)
- In many text/embedding cases vectors are all positive, so values tend to range from 0 to 1.

---

# 📙 **DAY 2 — DSA READING MATERIAL**

**Topic:** _Sliding Window — Your First Real Pattern_

Think of a **window** as a small box that you place on top of part of an array or string.

* You **look at only the items inside the box**
* Then you **slide** the box forward
* You keep checking or updating something (sum, length, count, etc.)

It’s like reading text with a highlight that moves along the line.

## 🌈 Why do we use it? 

Sliding Window helps when:

* You want to work with **continuous chunks** (subarrays/substrings)
* You want something like:

  * **maximum sum of K numbers**
  * **longest substring without repeating letters**
  * **count items within range**
  * **find a subarray that satisfies some condition**

Instead of checking every possible piece (which is slow), we keep **one moving window** and adjust it.

---

## 🌿 **1. When to Use Sliding Window**

Use sliding window when:

- you see **substring**
- you see **subarray**
- you want **longest**, **smallest**, or **maximum** something
- characters/values are **contiguous**

---

## 🧠 **2. Sliding Window Types**

### **Fixed Window (size k)**

Example:

> max sum of k-length subarray
The window size is constant (e.g., always size = 3).

Example:
“Find the max sum of any 3 continuous numbers.”
🧠 Core Rule

🔥 **Sliding window ALWAYS moves ONE step at a time.**

Why?

Because "sliding window" means:

> **Check every possible contiguous subarray of size k**
> and every such block starts exactly 1 index after the previous one.


### **Dynamic Window**

Example:

> longest substring without repeating characters

This is used 70% of the time.
A **dynamic (variable-size) sliding window** is a window that can:

* **Expand** (move `end` pointer forward)
* **Shrink** (move `start` pointer forward)

This is used when the window size is **NOT fixed**.
Instead, it depends on a **condition** (sum ≤ S, distinct ≤ K, no duplicates, etc.).

---

🧠 Core Algorithm (Dynamic Sliding Window)

Use two pointers:

* `start` → left side of window
* `end` → right side of window

🎯 Key Rule

> **Dynamic window problems ALWAYS involve a condition that must be satisfied.**

The window size is not given — you find it by expanding & shrinking based on conditions.

---

### 🧩 How to Identify: “Is this a dynamic window problem?”

Here are the **clear signs**:

---

### ✔️ **Sign 1: Window must grow until a condition becomes invalid**

Example conditions:

* sum goes above S
* more than K distinct characters
* too many zeroes
* a duplicate character enters

This ALWAYS means **dynamic**.

---

### ✔️ **Sign 2: Task says “longest”, “minimum length”, or “largest length” subarray**

These ALWAYS need **variable size**:

Examples:

* *Longest substring without repeating characters*
* *Longest substring with at most K distinct chars*
* *Smallest subarray with sum ≥ S*

These can’t use fixed windows because the size changes.

---

### ✔️ **Sign 3: No exact size (k) is given in the problem**

If the problem does NOT specify window size, it’s dynamic.

---

### ✔️ **Sign 4: Uses sets, maps, or counts to maintain conditions**

If the problem needs:

* `set()` to avoid duplicates
* `map/count` to track frequencies
* maintaining sum condition

It’s dynamic.

---

### ❌ Not Dynamic When:

* Problem gives exact window size **k**
  → fixed window
* You only need sum/avg/max of size **k**
  → fixed window

---

### 🧠 Simple Table to Remember

| Problem Type                                        | Window Type          |
| --------------------------------------------------- | -------------------- |
| Window size GIVEN                                   | ✔️ Fixed Window      |
| You search for BEST LENGTH                          | ✔️ Dynamic Window    |
| Condition can break (sum > S, repeat, distinct > K) | ✔️ Dynamic Window    |
| Use of frequency map / set                          | ✔️ Dynamic Window    |
| Only sum/max/min for size k                         | ❌ Dynamic → ✔️ Fixed |
---



✅ Do we need **start** and **end** pointers in BOTH fixed and dynamic windows?

### ✔️ Yes — **both** fixed and dynamic windows use:

* a **start pointer**
* an **end pointer**

Because the "sliding window" itself is defined by **two boundaries**:

```
[start ... end]
```

But **how** we use them is different.

---

# 📌 Difference Summary (Very Important)

| Window Type        | start pointer                   | end pointer             | How they move                                   |
| ------------------ | ------------------------------- | ----------------------- | ----------------------------------------------- |
| **Fixed Window**   | moves 1 step each slide         | moves 1 step each slide | Both move together → window size stays **same** |
| **Dynamic Window** | moves **when condition breaks** | moves every iteration   | Window size **grows & shrinks**                 |

---

# 🟦 1. FIXED WINDOW → Do we use start & end?

### ✔️ Yes

but movement is **simple and automatic**.

### How they move:

```
end++ always
start++ always
```

Window size stays **exactly k**.

Example window size = 3:

```
[0,1,2]
[1,2,3]
[2,3,4]
[3,4,5]
```

You **slide by 1** every time.

---

# 🟧 2. DYNAMIC WINDOW → Do we use start & end?

### ✔️ Yes

but movement is **conditional**.

### How they move:

```
end++  always (expand window)
start++  only when condition is violated
```

Example: "longest substring without repeating characters"

* expand end pointer
* if repeat happens → shrink from start until condition is valid

Dynamic window = expand + shrink.

---

# 💡 Easy Way to Remember

### 🔹 **Fixed window:**

> start + end move together (like a train).
> Window size never changes.

### 🔹 **Dynamic window:**

> end moves first.
> start moves only when rule breaks.
> Window can grow and shrink.

---

🧠 Visual Example

### Fixed Window (k = 3)

```
start=0 end=2  
start=1 end=3  
start=2 end=4  
start=3 end=5  
```

Both move together.

---

### Dynamic Window (avoid repeating chars)

```
Expand end:
[ a ]
[ a b ]
[ a b c ]

Repeat happens:
[ a b c a ] ❌

Shrink start:
  [ b c a ]  ✔️
```

Start moves **only when needed**.

---

# 🟢 Final Answer (Short)

> ✔️ YES — you always use **start** and **end** pointers in both fixed and dynamic sliding windows.
> ❗ BUT in fixed windows both move together, in dynamic windows only `end` moves always and `start` moves when condition breaks.

## ✅ Easy

1. Given an array of integers and an integer k, find the **maximum sum** of any contiguous subarray of size k. — *Hint: fixed window (size = k)*.
2. Given an array of positive integers and a positive number S, find the **length of the smallest contiguous subarray** whose sum is ≥ S. — *Hint: variable window (expand/shrink)*.
3. Given a string, find the **length of the longest substring without repeating characters**. — *Hint: variable window (shrink when repeat)*.
4. Given a string s and a non-empty string p, find **all start indices in s of p’s anagrams**. — *Hint: fixed window (size = |p|)*.
5. Given an array of 0s and 1s, and an integer k (you may replace at most k zeros with ones), find the **length of the longest contiguous subarray** containing only 1s. — *Hint: variable window (shrink when > k zeros)*.
6. Given a string, find the **length of the longest substring** with at most k distinct characters. — *Hint: variable window (shrink when distinct count > k)*.
7. Given an array of integers and a window size k, find for every contiguous subarray of size k the **maximum (or minimum) value**. — *Hint: fixed window (size = k)*.
8. Given an array of integers and a number k, count the number of contiguous subarrays of size k with **exactly m distinct elements**. — *Hint: fixed window (size = k)*.

---

### 🟡 Medium

9. Given two strings s and t, find the **minimum window in s** which will contain all the characters in t (including duplicates). — *Hint: variable window (expand until cover t, then shrink)*.
10. Given a string consisting of only three characters (for example ‘a’, ‘b’, ‘c’), count how many **substrings contain at least one of each character**. — *Hint: variable window (track counts of the three chars)*.
11. Given an array of integers, find the **length of the longest contiguous subarray** whose sum is equal to K. — *Hint: variable window if positives only; else requires extra structure [Unverified: sliding window may not suffice with negatives]*.
12. Given a string, find the **longest substring** where you can replace at most k characters to get a substring with **all same characters**. — *Hint: variable window (maximize window while replacement condition holds)*.
13. Given a binary array and an integer k, find the **number of subarrays with exactly k ones**. — *Hint: variable window (or fixed size windows + prefix counts) [Unverified: sliding window variant]*.
14. Given an array of characters where each character represents a fruit tree, you have two baskets and you can pick fruits until you encounter a third type; find the **maximum number of fruits you can pick** (i.e., longest contiguous subarray with at most 2 distinct characters). — *Hint: variable window (distinct types ≤ 2)*.
15. Given an array of integers, find the **maximum length of a contiguous subarray** with sum ≤ S. — *Hint: variable window (expand/shrink while sum > S)*.

---

### 🔴 Hard

16. Given an array of integers and window size k, compute the **sum of minimum and maximum elements** of every contiguous subarray of size k. — *Hint: fixed window (size = k, need track min & max efficiently)*.
17. Given a string and an integer k, find the **length of the longest substring** such that each character in the substring appears **at least k times**. — *Hint: variable window (complex constraint on counts)*.
18. Given an array of integers, find the **length of the longest contiguous subarray whose absolute difference between any two elements is at most k**. — *Hint: variable window (maintain max & min in window)*.
19. Given an array of integers, find the **subarray of size at least k** which has the **maximum average**. — *Hint: variable window (size ≥ k) + … [Unverified: sliding window alone may not suffice]*.
20. Given an array of integers and an integer k, find the **number of contiguous subarrays of size k** whose **median is greater than or equal to M**. — *Hint: fixed window (size = k) + median tracking [Unverified: more than basic sliding window]*.
