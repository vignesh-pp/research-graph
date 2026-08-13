import { addNode, addEdge, clearGraph, getAllNodes, getAllEdges } from "./graphStore";
import type { NodeType, RelationshipType } from "@/types/graph";

let edgeCounter = 0;
function eid(): string {
  edgeCounter += 1;
  return `edge-${edgeCounter}`;
}

export function seedGraph(): { nodes: number; edges: number } {
  clearGraph();
  edgeCounter = 0;

  // 1. Institutions (16)
  const institutions = [
    { id: "inst-1", name: "MIT CSAIL", location: "Cambridge, MA, USA", type: "Academic" },
    { id: "inst-2", name: "Stanford AI Lab (SAIL)", location: "Stanford, CA, USA", type: "Academic" },
    { id: "inst-3", name: "UC Berkeley BAIR", location: "Berkeley, CA, USA", type: "Academic" },
    { id: "inst-4", name: "Carnegie Mellon University", location: "Pittsburgh, PA, USA", type: "Academic" },
    { id: "inst-5", name: "University of Oxford", location: "Oxford, UK", type: "Academic" },
    { id: "inst-6", name: "University of Cambridge", location: "Cambridge, UK", type: "Academic" },
    { id: "inst-7", name: "ETH Zurich", location: "Zurich, Switzerland", type: "Academic" },
    { id: "inst-8", name: "University of Toronto", location: "Toronto, Canada", type: "Academic" },
    { id: "inst-9", name: "DeepMind", location: "London, UK", type: "Industry Research" },
    { id: "inst-10", name: "Google Research", location: "Mountain View, CA, USA", type: "Industry Research" },
    { id: "inst-11", name: "Meta AI (FAIR)", location: "Menlo Park, CA, USA", type: "Industry Research" },
    { id: "inst-12", name: "Microsoft Research", location: "Redmond, WA, USA", type: "Industry Research" },
    { id: "inst-13", name: "OpenAI", location: "San Francisco, CA, USA", type: "Industry Research" },
    { id: "inst-14", name: "Max Planck Institute for Informatics", location: "Saarbrücken, Germany", type: "Research Institute" },
    { id: "inst-15", name: "INRIA", location: "Paris, France", type: "Research Institute" },
    { id: "inst-16", name: "Tsinghua University", location: "Beijing, China", type: "Academic" },
  ];

  institutions.forEach((inst) => {
    addNode({
      id: inst.id,
      type: "Institution",
      label: inst.name,
      properties: inst,
    });
  });

  // 2. Topics (32)
  const topics = [
    { id: "top-1", name: "Large Language Models", category: "NLP", description: "Transformer-based language models trained on massive text corpora." },
    { id: "top-2", name: "Diffusion Models", category: "Generative AI", description: "Score-based generative models for continuous data synthesis." },
    { id: "top-3", name: "Graph Neural Networks", category: "Graph ML", description: "Neural networks operating on graph-structured data." },
    { id: "top-4", name: "Reinforcement Learning from Human Feedback", category: "Alignment", description: "Fine-tuning models using human preference comparisons." },
    { id: "top-5", name: "Vision Transformers", category: "Computer Vision", description: "Applying self-attention mechanisms to computer vision tasks." },
    { id: "top-6", name: "Retrieval-Augmented Generation", category: "NLP", description: "Enhancing language generation by retrieving relevant context." },
    { id: "top-7", name: "Parameter-Efficient Fine-Tuning", category: "NLP", description: "Adapting pre-trained models with minimal parameter updates." },
    { id: "top-8", name: "Knowledge Graphs", category: "Knowledge Representation", description: "Structured representations of facts, entities, and relationships." },
    { id: "top-9", name: "Multi-Modal AI", category: "Multimodal", description: "Models bridging text, vision, audio, and sensor modalities." },
    { id: "top-10", name: "Self-Supervised Learning", category: "Representation Learning", description: "Learning representations from unlabeled data via pretext tasks." },
    { id: "top-11", name: "Neuro-Symbolic AI", category: "Hybrid AI", description: "Combining neural learning with symbolic reasoning." },
    { id: "top-12", name: "Mechanistic Interpretability", category: "Safety", description: "Reverse engineering internal representations and circuits of neural networks." },
    { id: "top-13", name: "Autonomous Agents", category: "Agents", description: "LLM-driven agents executing multi-step tasks in complex environments." },
    { id: "top-14", name: "Quantum Machine Learning", category: "Quantum Computing", description: "Algorithms combining quantum circuits with machine learning." },
    { id: "top-15", name: "Continual Learning", category: "Lifelong Learning", description: "Learning continuously without catastrophic forgetting." },
    { id: "top-16", name: "3D Gaussian Splatting", category: "Computer Vision", description: "Real-time radiance field rendering using 3D Gaussians." },
    { id: "top-17", name: "Federated Learning", category: "Privacy", description: "Decentralized machine learning across distributed edge devices." },
    { id: "top-18", name: "Causal Inference", category: "Statistics", description: "Inferring cause-and-effect relationships from observational data." },
    { id: "top-19", name: "Model Quantization", category: "Efficiency", description: "Reducing precision of weights and activations for edge deployment." },
    { id: "top-20", name: "Protein Structure Prediction", category: "BioAI", description: "Predicting 3D conformations of biological macromolecules." },
    { id: "top-21", name: "Speech Recognition & Synthesis", category: "Audio", description: "Acoustic modeling and natural language audio synthesis." },
    { id: "top-22", name: "Explainable AI (XAI)", category: "Interpretability", description: "Methods to explain decisions of black-box AI systems." },
    { id: "top-23", name: "Zero-Shot Learning", category: "Generalization", description: "Recognizing concepts without explicit training examples." },
    { id: "top-24", name: "Contrastive Learning", category: "Representation Learning", description: "Training representations by contrasting positive and negative pairs." },
    { id: "top-25", name: "Adversarial Robustness", category: "Security", description: "Defending deep models against adversarial perturbations." },
    { id: "top-26", name: "Neural Architecture Search", category: "AutoML", description: "Automating the design of optimal neural network architectures." },
    { id: "top-27", name: "Mixture of Experts (MoE)", category: "Architecture", description: "Sparse routing through specialized sub-networks." },
    { id: "top-28", name: "Geometric Deep Learning", category: "Graph ML", description: "Deep learning on non-Euclidean domains like manifolds and graphs." },
    { id: "top-29", name: "Embodied AI & Robotics", category: "Robotics", description: "Physical intelligence and control in robotic embodiments." },
    { id: "top-30", name: "State Space Models (SSM / Mamba)", category: "Architecture", description: "Linear-time sequence modeling alternative to attention." },
    { id: "top-31", name: "Synthetic Data Generation", category: "Data Centric AI", description: "Generating high-quality training data using generative models." },
    { id: "top-32", name: "AI Alignment & Safety", category: "Safety", description: "Ensuring artificial general intelligence remains beneficial and controllable." },
  ];

  topics.forEach((t) => {
    addNode({
      id: t.id,
      type: "Topic",
      label: t.name,
      properties: t,
    });
  });

  // Topic Relationships
  const topicRelations = [
    ["top-1", "top-6"], ["top-1", "top-7"], ["top-1", "top-4"], ["top-1", "top-27"], ["top-1", "top-30"],
    ["top-2", "top-16"], ["top-2", "top-9"], ["top-2", "top-20"],
    ["top-3", "top-8"], ["top-3", "top-28"], ["top-3", "top-17"], ["top-3", "top-20"],
    ["top-4", "top-12"], ["top-4", "top-32"], ["top-4", "top-13"],
    ["top-5", "top-9"], ["top-5", "top-24"], ["top-5", "top-16"],
    ["top-6", "top-8"], ["top-6", "top-13"],
    ["top-7", "top-19"], ["top-7", "top-15"],
    ["top-8", "top-11"], ["top-8", "top-18"],
    ["top-10", "top-24"], ["top-10", "top-5"],
    ["top-11", "top-18"], ["top-11", "top-22"],
    ["top-12", "top-32"], ["top-12", "top-22"],
    ["top-13", "top-29"], ["top-13", "top-31"],
    ["top-18", "top-22"], ["top-19", "top-27"],
    ["top-28", "top-29"], ["top-29", "top-13"], ["top-29", "top-9"], ["top-29", "top-5"],
    ["top-30", "top-1"], ["top-31", "top-2"], ["top-32", "top-4"],
  ];

  topicRelations.forEach(([t1, t2]) => {
    addEdge({ id: eid(), source: t1, target: t2, type: "RELATED_TO" });
    addEdge({ id: eid(), source: t2, target: t1, type: "RELATED_TO" });
  });

  // 3. Methods (26)
  const methods = [
    { id: "meth-1", name: "Transformer Attention", category: "Architecture", description: "Scaled dot-product multi-head attention mechanism." },
    { id: "meth-2", name: "LoRA (Low-Rank Adaptation)", category: "Fine-Tuning", description: "Freezes pre-trained weights and injects trainable low-rank decomposition matrices." },
    { id: "meth-3", name: "Denoising Diffusion Probabilistic Models (DDPM)", category: "Sampling", description: "Iterative denoising via reverse Markov transition kernels." },
    { id: "meth-4", name: "Proximal Policy Optimization (PPO)", category: "Reinforcement Learning", description: "Policy gradient method using clipped surrogate objective." },
    { id: "meth-5", name: "Direct Preference Optimization (DPO)", category: "Alignment", description: "Implicitly optimizes preference reward via closed-form policy loss." },
    { id: "meth-6", name: "Graph Convolutional Network (GCN)", category: "Graph ML", description: "First-order spectral approximation of localized graph convolutions." },
    { id: "meth-7", name: "FlashAttention", category: "Kernel Optimization", description: "IO-aware exact attention algorithm using tiling and recomputation." },
    { id: "meth-8", name: "Dense Passage Retrieval (DPR)", category: "Information Retrieval", description: "Dual-encoder BERT architecture for semantic passage retrieval." },
    { id: "meth-9", name: "Contrastive Language-Image Pretraining (CLIP)", category: "Multimodal", description: "Joint text-image embedding space trained with InfoNCE loss." },
    { id: "meth-10", name: "QLoRA", category: "Quantization", description: "Quantized 4-bit Base Model with NF4 datatype and Double Quantization." },
    { id: "meth-11", name: "Message Passing Neural Network (MPNN)", category: "Graph ML", description: "Generalized framework for edge and node feature propagation." },
    { id: "meth-12", name: "Rotary Position Embedding (RoPE)", category: "Positional Encoding", description: "Rotates query and key vectors in complex plane to encode relative position." },
    { id: "meth-13", name: "Constitutional AI", category: "Safety", description: "Self-improving AI alignment using a set of guiding principles." },
    { id: "meth-14", name: "Speculative Decoding", category: "Inference Optimization", description: "Accelerating LLM generation using smaller draft models." },
    { id: "meth-15", name: "Vector Symbolic Architectures", category: "Neuro-Symbolic", description: "High-dimensional hyperdimensional computing for symbolic binding." },
    { id: "meth-16", name: "Neural Radiance Fields (NeRF)", category: "3D Vision", description: "Continuous 5D scene representation with volumetric rendering." },
    { id: "meth-17", name: "Latent Diffusion Models (LDM)", category: "Generative AI", description: "Applying diffusion process in lower-dimensional latent space." },
    { id: "meth-18", name: "Path-based Knowledge Graph Embedding (TransE)", category: "Knowledge Graph", description: "Translational distance model for relationship embeddings." },
    { id: "meth-19", name: "Chain-of-Thought Prompting (CoT)", category: "Prompting", description: "Eliciting multi-step intermediate reasoning steps." },
    { id: "meth-20", name: "Tree of Thoughts (ToT)", category: "Search & Reasoning", description: "Deliberate problem solving via heuristic tree search over thoughts." },
    { id: "meth-21", name: "Selective State Space (Mamba)", category: "Sequence Modeling", description: "Input-dependent time-varying selection mechanism for state spaces." },
    { id: "meth-22", name: "Graph Attention Network (GAT)", category: "Graph ML", description: "Masked self-attention layers to assign different importances to neighbors." },
    { id: "meth-23", name: "SimCLR", category: "Self-Supervised", description: "Simple framework for contrastive learning of visual representations." },
    { id: "meth-24", name: "Prefix Tuning", category: "Parameter-Efficient", description: "Prepending continuous learnable virtual prefix vectors to keys/values." },
    { id: "meth-25", name: "Sparse Mixture-of-Experts Routing", category: "Architecture", description: "Top-k gating network dynamically routing tokens to specialized experts." },
    { id: "meth-26", name: "Diffusion Policy", category: "Robotics", description: "Representing complex multimodal robot action distributions using diffusion." },
  ];

  methods.forEach((m) => {
    addNode({
      id: m.id,
      type: "Method",
      label: m.name,
      properties: m,
    });
  });

  // 4. Datasets (21)
  const datasets = [
    { id: "data-1", name: "Common Crawl", domain: "Web Text", url: "https://commoncrawl.org", description: "Petabyte-scale repository of web crawl data." },
    { id: "data-2", name: "The Pile", domain: "Curated Text", url: "https://pile.eleuther.ai", description: "825 GiB diverse English text corpus for language modeling." },
    { id: "data-3", name: "LAION-5B", domain: "Vision & Language", url: "https://laion.ai", description: "5.85 billion image-text pairs filtered with CLIP." },
    { id: "data-4", name: "ImageNet-1k", domain: "Computer Vision", url: "https://image-net.org", description: "Benchmark dataset with 1.2M labeled images across 1000 classes." },
    { id: "data-5", name: "OpenWebText", domain: "NLP", url: "https://skylion007.github.io/OpenWebTextCorpus", description: "Open recreation of WebText dataset." },
    { id: "data-6", name: "OGB (Open Graph Benchmark)", domain: "Graph ML", url: "https://ogb.stanford.edu", description: "Realistic, large-scale benchmarks for machine learning on graphs." },
    { id: "data-7", name: "HumanEval", domain: "Code Generation", url: "https://github.com/openai/human-eval", description: "164 hand-crafted Python programming problems with unit tests." },
    { id: "data-8", name: "MMLU (Massive Multitask Language Understanding)", domain: "Evaluation", url: "https://github.com/hendrycks/test", description: "Exam benchmark covering 57 subjects across STEM, humanities, and social sciences." },
    { id: "data-9", name: "MS-COCO", domain: "Computer Vision", url: "https://cocodataset.org", description: "Object detection, segmentation, and captioning dataset." },
    { id: "data-10", name: "Cora Citation Network", domain: "Graph ML", url: "https://graphsandnetworks.com/the-cora-dataset", description: "Machine learning paper citation network with 2,708 scientific publications." },
    { id: "data-11", name: "PubMed Central Open Access", domain: "Biomedical", url: "https://ncbi.nlm.nih.gov/pmc", description: "Millions of full-text biomedical research articles." },
    { id: "data-12", name: "PDB (Protein Data Bank)", domain: "Structural Biology", url: "https://www.rcsb.org", description: "3D structural data of large biological molecules." },
    { id: "data-13", name: "GSM8K", domain: "Mathematical Reasoning", url: "https://github.com/openai/grade-school-math", description: "8,500 grade school math word problems." },
    { id: "data-14", name: "Anthropic HH-RLHF", domain: "Alignment", url: "https://huggingface.co/datasets/Anthropic/hh-rlhf", description: "Human preference dataset for helpful and harmless AI behavior." },
    { id: "data-15", name: "SQuAD 2.0", domain: "Question Answering", url: "https://rajpurkar.github.io/SQuAD-explorer", description: "150k questions on Wikipedia articles including unanswerable queries." },
    { id: "data-16", name: "MATH Dataset", domain: "Competition Math", url: "https://github.com/hendrycks/math", description: "12,500 challenging high school competition math problems." },
    { id: "data-17", name: "Natural Questions", domain: "Open-Domain QA", url: "https://ai.google.com/research/NaturalQuestions", description: "Real Google search queries with full Wikipedia reference pages." },
    { id: "data-18", name: "Freebase FB15k-237", domain: "Knowledge Graph", url: "https://www.microsoft.com/en-us/research/publication/fb15k-237", description: "Knowledge graph link prediction benchmark." },
    { id: "data-19", name: "UltraFeedback", domain: "Preference Alignment", url: "https://huggingface.co/datasets/openbmb/UltraFeedback", description: "Large-scale multi-aspect preference evaluation dataset." },
    { id: "data-20", name: "Chatbot Arena Conversations", domain: "Human Evaluation", url: "https://chat.lmsys.org", description: "Crowdsourced pairwise model preference comparisons." },
    { id: "data-21", name: "RoboMimic", domain: "Robotics", url: "https://robomimic.github.io", description: "Large-scale robot manipulation demonstration benchmark." },
  ];

  datasets.forEach((d) => {
    addNode({
      id: d.id,
      type: "Dataset",
      label: d.name,
      properties: d,
    });
  });

  // 5. Researchers (55)
  const researcherNames = [
    { name: "Dr. Ashish Vaswani", interest: "Transformer Architectures & Self-Attention Scalability", inst: "inst-10" },
    { name: "Dr. Noam Shazeer", interest: "Sparse Mixture-of-Experts & Massive Scale Language Pretraining", inst: "inst-10" },
    { name: "Dr. Yann LeCun", interest: "Self-Supervised Learning, World Models & Computer Vision", inst: "inst-11" },
    { name: "Dr. Yoshua Bengio", interest: "Deep Representation Learning, Causal Discovery & AI Safety", inst: "inst-8" },
    { name: "Dr. Geoffrey Hinton", interest: "Capsule Networks, Neural Representation & Cognitive Learning", inst: "inst-8" },
    { name: "Dr. Fei-Fei Li", interest: "Spatial Intelligence, Visual Understanding & Ambient AI", inst: "inst-2" },
    { name: "Dr. Christopher Manning", interest: "Neural Natural Language Processing & Compositional Semantics", inst: "inst-2" },
    { name: "Dr. Jure Leskovec", interest: "Graph Neural Networks, Relational Learning & Network Science", inst: "inst-2" },
    { name: "Dr. Michael Bronstein", interest: "Geometric Deep Learning, Graph Neural PDEs & Protein Graphs", inst: "inst-5" },
    { name: "Dr. Max Welling", interest: "Equivariant Graph Networks, Bayesian Deep Learning & Quantum ML", inst: "inst-15" },
    { name: "Dr. Thomas Kipf", interest: "Graph Convolutional Networks & Relational Inductive Biases", inst: "inst-9" },
    { name: "Dr. Petar Veličković", interest: "Graph Attention Networks, Neural Algorithmic Reasoning & Graph PDEs", inst: "inst-9" },
    { name: "Dr. Christopher Ré", interest: "Hardware-Aware Machine Learning & State Space Architectures", inst: "inst-2" },
    { name: "Dr. Percy Liang", interest: "Foundation Model Evaluation, Robust Benchmarking & Semantic Parsing", inst: "inst-2" },
    { name: "Dr. Tri Dao", interest: "IO-Aware FlashAttention & Linear-Time Sequence Models", inst: "inst-3" },
    { name: "Dr. Albert Gu", interest: "Structured State Space Models, S4 & Mamba Architectures", inst: "inst-4" },
    { name: "Dr. Tim Dettmers", interest: "k-bit Quantization, QLoRA & Memory-Efficient Optimization", inst: "inst-3" },
    { name: "Dr. Edward Hu", interest: "Low-Rank Adaptation (LoRA) & Parameter-Efficient Tuning", inst: "inst-12" },
    { name: "Dr. John Schulman", interest: "Reinforcement Learning from Human Feedback (RLHF) & Policy Search", inst: "inst-13" },
    { name: "Dr. Rafael Rafailov", interest: "Direct Preference Optimization (DPO) & Implicit Reward Learning", inst: "inst-2" },
    { name: "Dr. Jascha Sohl-Dickstein", interest: "Non-Equilibrium Thermodynamics & Deep Generative Diffusion", inst: "inst-10" },
    { name: "Dr. Jonathan Ho", interest: "Denoising Diffusion Probabilistic Models (DDPM) & Video Diffusion", inst: "inst-10" },
    { name: "Dr. Robin Rombach", interest: "Latent Diffusion Models, High-Resolution Synthesis & Stable Diffusion", inst: "inst-14" },
    { name: "Dr. Alec Radford", interest: "Multimodal Representation Learning, CLIP & Generative GPT", inst: "inst-13" },
    { name: "Dr. Ilya Sutskever", interest: "Sequence-to-Sequence Learning, Deep Pretraining & Superalignment", inst: "inst-13" },
    { name: "Dr. Dario Amodei", interest: "Scaling Laws for Neural Models & Constitutional AI Safety", inst: "inst-13" },
    { name: "Dr. Chris Olah", interest: "Mechanistic Interpretability, Superposition & Neural Circuits", inst: "inst-13" },
    { name: "Dr. Andrew Ng", interest: "Data-Centric AI, Large Scale Deep Learning & Applied AI Systems", inst: "inst-2" },
    { name: "Dr. Pieter Abbeel", interest: "Robot Learning, Deep Reinforcement Learning & Motion Planning", inst: "inst-3" },
    { name: "Dr. Sergey Levine", interest: "Offline Reinforcement Learning, Robotic Manipulation & Vision-Action", inst: "inst-3" },
    { name: "Dr. Chelsea Finn", interest: "Model-Agnostic Meta-Learning & Interactive Robotic Learning", inst: "inst-2" },
    { name: "Dr. Kaiming He", interest: "Deep Residual Networks (ResNet), Mask R-CNN & Masked Autoencoders", inst: "inst-1" },
    { name: "Dr. Ross Girshick", interest: "Object Detection Frameworks, Visual Recognition & R-CNN Family", inst: "inst-11" },
    { name: "Dr. Demis Hassabis", interest: "Artificial General Intelligence, AlphaFold & Deep Reinforcement Learning", inst: "inst-9" },
    { name: "Dr. John Jumper", interest: "AlphaFold2 Architecture, Protein Structural Prediction & Biophysics", inst: "inst-9" },
    { name: "Dr. Bernhard Schölkopf", interest: "Causal Representation Learning, Kernel Methods & Empirical Inference", inst: "inst-14" },
    { name: "Dr. Judea Pearl", interest: "Causal Bayesian Networks, Structural Causal Models & Counterfactuals", inst: "inst-3" },
    { name: "Dr. Regina Barzilay", interest: "AI for Drug Discovery, Molecular Graph Design & Oncology NLP", inst: "inst-1" },
    { name: "Dr. Tommi Jaakkola", interest: "Equivariant Diffusion for Molecules & Machine Learning Theory", inst: "inst-1" },
    { name: "Dr. Stefanie Jegelka", interest: "Expressive Graph Neural Networks, Subgraph Representations & Combinatorics", inst: "inst-1" },
    { name: "Dr. Danqi Chen", interest: "Dense Retrieval, Relation Extraction & Knowledge Retrieval in LLMs", inst: "inst-2" },
    { name: "Dr. Jason Wei", interest: "Chain-of-Thought Prompting & Emergent Abilities of Large Language Models", inst: "inst-13" },
    { name: "Dr. Denny Zhou", interest: "Algorithmic Reasoning, Tree-of-Thoughts & Self-Consistency Prompting", inst: "inst-10" },
    { name: "Dr. Shunyu Yao", interest: "ReAct Agents, Tree of Thoughts & Language Model Interactive Reasoning", inst: "inst-2" },
    { name: "Dr. Alexey Dosovitskiy", interest: "Vision Transformers (ViT) & Self-Attention for Visual Perception", inst: "inst-10" },
    { name: "Dr. Ting Chen", interest: "Contrastive Visual Representation (SimCLR) & Diffusion Generation", inst: "inst-10" },
    { name: "Dr. Shixiang Shane Gu", interest: "Continuous Control, Robotic Policy Synthesis & Model-Based RL", inst: "inst-13" },
    { name: "Dr. Silvio Micali", interest: "Zero-Knowledge Proofs & Distributed Computation", inst: "inst-1" },
    { name: "Dr. Alex Graves", interest: "Recurrent Sequence Transduction & Neural Turing Machines", inst: "inst-9" },
    { name: "Dr. Karen Simonyan", interest: "Very Deep Convolutional Networks & AlphaFold2", inst: "inst-9" },
    { name: "Dr. Pushmeet Kohli", interest: "AI for Science, Quantum Chemistry & Verification", inst: "inst-9" },
    { name: "Dr. Cordelia Schmid", interest: "Video Understanding & Multimodal Temporal Learning", inst: "inst-15" },
    { name: "Dr. Francis Bach", interest: "Convex Optimization & Machine Learning Theory", inst: "inst-15" },
    { name: "Dr. Zhi-Hua Zhou", interest: "Ensemble Methods, Continual Learning & Forest Models", inst: "inst-16" },
    { name: "Dr. Bo Li", interest: "Trustworthy Machine Learning & Robust Safety Bounds", inst: "inst-3" },
  ];

  researcherNames.forEach((r, i) => {
    const id = `res-${i + 1}`;
    const email = `${r.name.toLowerCase().replace(/[^a-z]/g, "")}@${r.inst.replace("inst-", "inst")}.edu`;
    const bio = `${r.name} is a renowned senior scientist contributing extensively to ${r.interest.toLowerCase()}.`;

    addNode({
      id,
      type: "Researcher",
      label: r.name,
      properties: {
        id,
        name: r.name,
        email,
        bio,
        researchInterest: r.interest,
      },
    });

    addEdge({ id: eid(), source: id, target: r.inst, type: "AFFILIATED_WITH" });
  });

  // Researcher Collaborations
  const collaborations = [
    [1, 2], [1, 15], [2, 16], [3, 4], [3, 5], [4, 5], [6, 7], [7, 8], [8, 9],
    [8, 10], [9, 10], [9, 11], [10, 11], [13, 14], [14, 18], [15, 16], [15, 17],
    [17, 18], [19, 20], [19, 24], [19, 25], [20, 26], [21, 22], [21, 23], [22, 23],
    [24, 25], [24, 26], [26, 27], [28, 29], [29, 30], [29, 31], [30, 31], [32, 33],
    [34, 35], [34, 50], [35, 51], [36, 37], [37, 38], [39, 40], [39, 34], [41, 6],
    [42, 43], [42, 44], [44, 45], [44, 46], [45, 46], [47, 48], [49, 50], [50, 51],
    [52, 53], [54, 55], [1, 19], [3, 36], [7, 14], [8, 39], [13, 44], [16, 2], [24, 37],
    [29, 30], [29, 47], [30, 47],
  ];

  collaborations.forEach(([r1, r2]) => {
    addEdge({ id: eid(), source: `res-${r1}`, target: `res-${r2}`, type: "COLLABORATED_WITH" });
    addEdge({ id: eid(), source: `res-${r2}`, target: `res-${r1}`, type: "COLLABORATED_WITH" });
  });

  // 6. Papers (108 papers)
  const papersData = [
    { id: "pap-1", title: "Attention Is All You Need", publicationYear: 2017, venue: "NeurIPS", doi: "10.5555/3295222.3295349", url: "https://arxiv.org/abs/1706.03762", abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, based solely on attention mechanisms.", authors: ["res-1", "res-2"], topics: ["top-1"], methods: ["meth-1"], datasets: ["data-1"] },
    { id: "pap-2", title: "Language Models are Few-Shot Learners (GPT-3)", publicationYear: 2020, venue: "NeurIPS", doi: "10.5555/3495724.3495883", url: "https://arxiv.org/abs/2005.14165", abstract: "We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance, achieving competitive results with state-of-the-art fine-tuning approaches.", authors: ["res-25", "res-24"], topics: ["top-1", "top-23"], methods: ["meth-1"], datasets: ["data-1", "data-5"] },
    { id: "pap-3", title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", publicationYear: 2022, venue: "NeurIPS", doi: "10.48550/arXiv.2205.14135", url: "https://arxiv.org/abs/2205.14135", abstract: "Transformers are slow and memory-hungry on long sequences. We present FlashAttention, an IO-aware exact attention algorithm that uses tiling to prevent redundant GPU HBM reads/writes.", authors: ["res-15", "res-13"], topics: ["top-1", "top-19"], methods: ["meth-7", "meth-1"], datasets: ["data-2"] },
    { id: "pap-4", title: "LoRA: Low-Rank Adaptation of Large Language Models", publicationYear: 2021, venue: "ICLR", doi: "10.48550/arXiv.2106.09685", url: "https://arxiv.org/abs/2106.09685", abstract: "LoRA reduces the number of trainable parameters by 10,000 times and GPU memory requirements by 3 times by freezing weights and injecting low-rank decomposition matrices.", authors: ["res-18"], topics: ["top-7", "top-1"], methods: ["meth-2"], datasets: ["data-8", "data-17"] },
    { id: "pap-5", title: "QLoRA: Efficient Finetuning of Quantized LLMs", publicationYear: 2023, venue: "NeurIPS", doi: "10.48550/arXiv.2305.14314", url: "https://arxiv.org/abs/2305.14314", abstract: "We present QLoRA, an efficient finetuning approach that reduces memory usage enough to finetune a 65B parameter model on a single 48GB GPU while preserving full 16-bit finetuning task performance.", authors: ["res-17", "res-18"], topics: ["top-7", "top-19"], methods: ["meth-10", "meth-2"], datasets: ["data-8", "data-14"] },
    { id: "pap-6", title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces", publicationYear: 2023, venue: "arXiv", doi: "10.48550/arXiv.2312.00752", url: "https://arxiv.org/abs/2312.00752", abstract: "Transformers have quadratic complexity. We propose Mamba, a selective state space model achieving linear-time sequence scaling with fast inference and strong reasoning performance.", authors: ["res-16", "res-15"], topics: ["top-30", "top-1"], methods: ["meth-21"], datasets: ["data-2", "data-8"] },
    { id: "pap-7", title: "Dense Passage Retrieval for Open-Domain Question Answering", publicationYear: 2020, venue: "EMNLP", doi: "10.18653/v1/2020.emnlp-main.550", url: "https://arxiv.org/abs/2004.04906", abstract: "Open-domain QA relies on efficient passage retrieval. We show that retrieval can be implemented using dense representations learned by dual-encoders over a simple contrastive objective.", authors: ["res-14", "res-7"], topics: ["top-6", "top-1"], methods: ["meth-8"], datasets: ["data-17", "data-15"] },
    { id: "pap-8", title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", publicationYear: 2020, venue: "NeurIPS", doi: "10.48550/arXiv.2005.11401", url: "https://arxiv.org/abs/2005.11401", abstract: "We explore general-purpose fine-tuning recipes for Retrieval-Augmented Generation (RAG) models combining pre-trained parametric and non-parametric memory for language generation.", authors: ["res-14", "res-11"], topics: ["top-6", "top-8"], methods: ["meth-8", "meth-1"], datasets: ["data-17", "data-18"] },
    { id: "pap-9", title: "Deep Residual Learning for Image Recognition (ResNet)", publicationYear: 2016, venue: "CVPR", doi: "10.1109/CVPR.2016.90", url: "https://arxiv.org/abs/1512.03385", abstract: "We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously, enabling training up to 152 layers.", authors: ["res-32", "res-33"], topics: ["top-10"], methods: ["meth-1"], datasets: ["data-4", "data-9"] },
    { id: "pap-10", title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)", publicationYear: 2021, venue: "ICLR", doi: "10.48550/arXiv.2010.11929", url: "https://arxiv.org/abs/2010.11929", abstract: "While Transformer architecture has become the de-facto standard for NLP, we show that a pure transformer applied directly to sequences of image patches performs exceptionally well on image classification.", authors: ["res-1", "res-45"], topics: ["top-5", "top-1"], methods: ["meth-1"], datasets: ["data-4"] },
    { id: "pap-11", title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)", publicationYear: 2021, venue: "ICML", doi: "10.48550/arXiv.2103.00020", url: "https://arxiv.org/abs/2103.00020", abstract: "State-of-the-art vision systems are trained to predict a fixed set of predetermined categories. We show that predicting which caption goes with which image achieves remarkable zero-shot transfer.", authors: ["res-24", "res-25"], topics: ["top-9", "top-23", "top-24"], methods: ["meth-9", "meth-23"], datasets: ["data-3", "data-4"] },
    { id: "pap-12", title: "High-Resolution Image Synthesis with Latent Diffusion Models", publicationYear: 2022, venue: "CVPR", doi: "10.1109/CVPR52688.2022.01042", url: "https://arxiv.org/abs/2112.10752", abstract: "By decomposing the image formation process into a sequential application of denoising autoencoders in latent space, diffusion models achieve state-of-the-art synthesis while lowering compute needs.", authors: ["res-23"], topics: ["top-2", "top-9"], methods: ["meth-17", "meth-3"], datasets: ["data-3", "data-9"] },
    { id: "pap-13", title: "Denoising Diffusion Probabilistic Models", publicationYear: 2020, venue: "NeurIPS", doi: "10.48550/arXiv.2006.11239", url: "https://arxiv.org/abs/2006.11239", abstract: "We present high quality image synthesis results using diffusion probabilistic models, parameterized by a connection between diffusion models and denoising score matching with Langevin dynamics.", authors: ["res-22", "res-21"], topics: ["top-2"], methods: ["meth-3"], datasets: ["data-4"] },
    { id: "pap-14", title: "Deep Non-Equilibrium Thermodynamics Diffusion Models", publicationYear: 2015, venue: "ICML", doi: "10.48550/arXiv.1503.03585", url: "https://arxiv.org/abs/1503.03585", abstract: "We propose a novel framework that systematically destroys structure in a data distribution through an iterative forward diffusion process, then learns a reverse process to restore structure.", authors: ["res-21"], topics: ["top-2"], methods: ["meth-3"], datasets: ["data-4"] },
    { id: "pap-15", title: "Semi-Supervised Classification with Graph Convolutional Networks", publicationYear: 2017, venue: "ICLR", doi: "10.48550/arXiv.1609.02907", url: "https://arxiv.org/abs/1609.02907", abstract: "We present a scalable approach for semi-supervised learning on graph-structured data based on an efficient first-order approximation of spectral convolutions on graphs.", authors: ["res-10", "res-11"], topics: ["top-3", "top-28"], methods: ["meth-6"], datasets: ["data-10", "data-6"] },
    { id: "pap-16", title: "Graph Attention Networks", publicationYear: 2018, venue: "ICLR", doi: "10.48550/arXiv.1710.10903", url: "https://arxiv.org/abs/1710.10903", abstract: "We present Graph Attention Networks (GATs), novel neural network architectures that operate on graph-structured data, leveraging masked self-attentional layers to address GCN limitations.", authors: ["res-12", "res-9"], topics: ["top-3", "top-28"], methods: ["meth-22", "meth-6"], datasets: ["data-10", "data-6"] },
    { id: "pap-17", title: "Open Graph Benchmark: Datasets for Machine Learning on Graphs", publicationYear: 2020, venue: "NeurIPS", doi: "10.48550/arXiv.2005.00687", url: "https://arxiv.org/abs/2005.00687", abstract: "We present the Open Graph Benchmark (OGB), a diverse, realistic, and large-scale benchmark suite for machine learning on graphs covering node, link, and graph-level predictions.", authors: ["res-8", "res-9", "res-12"], topics: ["top-3", "top-8"], methods: ["meth-6", "meth-11"], datasets: ["data-6"] },
    { id: "pap-18", title: "Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges", publicationYear: 2021, venue: "arXiv", doi: "10.48550/arXiv.2104.13478", url: "https://arxiv.org/abs/2104.13478", abstract: "We provide an overarching mathematical blueprint for deep learning on geometric domains, formalizing invariance and equivariance principles across graphs and manifolds.", authors: ["res-9", "res-8", "res-10"], topics: ["top-28", "top-3"], methods: ["meth-11"], datasets: ["data-6"] },
    { id: "pap-19", title: "Highly Accurate Protein Structure Prediction with AlphaFold", publicationYear: 2021, venue: "Nature", doi: "10.1038/s41586-021-03819-2", url: "https://www.nature.com/articles/s41586-021-03819-2", abstract: "We demonstrate that neural networks can predict 3D protein structures with atomic accuracy across entire proteomes using evolutionary and spatial graph attention representations.", authors: ["res-34", "res-35", "res-51"], topics: ["top-20", "top-3"], methods: ["meth-1", "meth-11"], datasets: ["data-12"] },
    { id: "pap-20", title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", publicationYear: 2022, venue: "NeurIPS", doi: "10.48550/arXiv.2201.11903", url: "https://arxiv.org/abs/2201.11903", abstract: "We explore how generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning.", authors: ["res-42", "res-43"], topics: ["top-1", "top-11"], methods: ["meth-19"], datasets: ["data-8", "data-13"] },
    { id: "pap-21", title: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models", publicationYear: 2023, venue: "NeurIPS", doi: "10.48550/arXiv.2305.10601", url: "https://arxiv.org/abs/2305.10601", abstract: "We introduce Tree of Thoughts (ToT), which enables exploration over coherent units of text (thoughts) that serve as intermediate steps toward problem solving via heuristic search.", authors: ["res-44", "res-43", "res-42"], topics: ["top-13", "top-11"], methods: ["meth-20", "meth-19"], datasets: ["data-13"] },
    { id: "pap-22", title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model", publicationYear: 2023, venue: "NeurIPS", doi: "10.48550/arXiv.2305.18290", url: "https://arxiv.org/abs/2305.18290", abstract: "We show how to optimize language models directly from human preferences without training explicit reward models or using reinforcement learning in the loop.", authors: ["res-20", "res-19"], topics: ["top-4", "top-32"], methods: ["meth-5"], datasets: ["data-14", "data-19"] },
    { id: "pap-23", title: "Training Language Models to Follow Instructions with Human Feedback (InstructGPT)", publicationYear: 2022, venue: "NeurIPS", doi: "10.48550/arXiv.2203.02155", url: "https://arxiv.org/abs/2203.02155", abstract: "We show that fine-tuning with reinforcement learning from human feedback (RLHF) makes language models significantly more aligned with user intent and safer in generation.", authors: ["res-19", "res-25"], topics: ["top-4", "top-32"], methods: ["meth-4"], datasets: ["data-14", "data-8"] },
    { id: "pap-24", title: "Constitutional AI: Harmlessness from AI Feedback", publicationYear: 2022, venue: "arXiv", doi: "10.48550/arXiv.2212.08073", url: "https://arxiv.org/abs/2212.08073", abstract: "We present Constitutional AI, a method for training harmless AI assistants through self-critique and revision according to a list of natural language rules, minimizing human annotation.", authors: ["res-26", "res-27"], topics: ["top-32", "top-4"], methods: ["meth-13", "meth-4"], datasets: ["data-14"] },
    { id: "pap-25", title: "Zoom In: An Introduction to Circuits in Deep Neural Networks", publicationYear: 2020, venue: "Distill", doi: "10.23915/distill.00024.001", url: "https://distill.pub/2020/circuits/zoom-in/", abstract: "We formulate mechanistic interpretability as reverse engineering neural network circuits, identifying polysemanticity, superposition, and individual feature detectors.", authors: ["res-27"], topics: ["top-12", "top-22"], methods: ["meth-1"], datasets: ["data-4"] },
  ];

  // Generate papers 26 to 108 systematically connecting ALL 32 topics
  const extraVenues = ["ICML", "NeurIPS", "ICLR", "ACL", "CVPR", "KDD", "Nature Machine Intelligence", "Science Robotics", "EMNLP", "AAAI"];
  for (let i = 26; i <= 108; i++) {
    const topicIndex = (i - 1) % topics.length;
    const top = topics[topicIndex];
    const methodIndex = (i - 1) % methods.length;
    const meth = methods[methodIndex];
    const datasetIndex = (i - 1) % datasets.length;
    const data = datasets[datasetIndex];

    const authorIndex1 = ((i * 3) % researcherNames.length) + 1;
    const authorIndex2 = ((i * 7 + 1) % researcherNames.length) + 1;
    const year = 2018 + (i % 7);
    const venue = extraVenues[i % extraVenues.length];

    papersData.push({
      id: `pap-${i}`,
      title: `Advances in ${top.name}: Scaling ${meth.name} on ${data.name}`,
      abstract: `This study explores theoretical frontiers and empirical boundaries of ${top.name.toLowerCase()} by applying ${meth.name} across heterogeneous benchmarks from ${data.name}. We demonstrate consistent performance improvements and enhanced generalization.`,
      publicationYear: year,
      venue,
      doi: `10.1145/${3400000 + i}.${3500000 + i}`,
      url: `https://arxiv.org/abs/${year - 2000}${String(i).padStart(4, "0")}`,
      authors: [`res-${authorIndex1}`, `res-${authorIndex2}`],
      topics: [top.id],
      methods: [meth.id],
      datasets: [data.id],
    });
  }

  // Add specific Embodied AI & Robotics (top-29) papers
  papersData.push({
    id: "pap-109",
    title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion",
    abstract: "We introduce Diffusion Policy, a new way of generating robot visuomotor policies by representing robot action distributions using conditional denoising diffusion models across diverse manipulation benchmarks.",
    publicationYear: 2023,
    venue: "Science Robotics",
    doi: "10.1126/scirobotics.adj5884",
    url: "https://diffusion-policy.cs.columbia.edu",
    authors: ["res-29", "res-30"],
    topics: ["top-29", "top-2"],
    methods: ["meth-26", "meth-3"],
    datasets: ["data-21", "data-9"],
  });

  papersData.push({
    id: "pap-110",
    title: "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control",
    abstract: "We investigate how vision-language models pre-trained on web-scale text and images can be directly translated into end-to-end robotic actions for generalized embodied task execution.",
    publicationYear: 2023,
    venue: "CoRL",
    doi: "10.48550/arXiv.2307.15818",
    url: "https://robotics-transformer2.github.io",
    authors: ["res-29", "res-31", "res-47"],
    topics: ["top-29", "top-9", "top-13"],
    methods: ["meth-9", "meth-1"],
    datasets: ["data-21", "data-3"],
  });

  papersData.forEach((p) => {
    addNode({
      id: p.id,
      type: "Paper",
      label: p.title,
      properties: {
        id: p.id,
        title: p.title,
        abstract: p.abstract,
        publicationYear: p.publicationYear,
        venue: p.venue,
        doi: p.doi,
        url: p.url,
      },
    });

    p.authors.forEach((aId) => addEdge({ id: eid(), source: aId, target: p.id, type: "AUTHORED" }));
    p.topics.forEach((tId) => addEdge({ id: eid(), source: p.id, target: tId, type: "ABOUT" }));
    p.methods.forEach((mId) => addEdge({ id: eid(), source: p.id, target: mId, type: "USES_METHOD" }));
    p.datasets.forEach((dId) => addEdge({ id: eid(), source: p.id, target: dId, type: "USES_DATASET" }));
  });

  // Citations
  const coreCitations = [
    ["pap-2", "pap-1"], ["pap-3", "pap-1"], ["pap-4", "pap-1"], ["pap-5", "pap-4"],
    ["pap-5", "pap-1"], ["pap-6", "pap-1"], ["pap-7", "pap-1"], ["pap-8", "pap-7"],
    ["pap-8", "pap-1"], ["pap-10", "pap-1"], ["pap-10", "pap-9"], ["pap-11", "pap-10"],
    ["pap-11", "pap-1"], ["pap-12", "pap-13"], ["pap-13", "pap-14"], ["pap-12", "pap-11"],
    ["pap-16", "pap-15"], ["pap-17", "pap-15"], ["pap-17", "pap-16"], ["pap-18", "pap-15"],
    ["pap-18", "pap-16"], ["pap-19", "pap-1"], ["pap-19", "pap-16"], ["pap-20", "pap-2"],
    ["pap-20", "pap-1"], ["pap-21", "pap-20"], ["pap-21", "pap-2"], ["pap-22", "pap-23"],
    ["pap-22", "pap-2"], ["pap-23", "pap-2"], ["pap-24", "pap-23"], ["pap-25", "pap-1"],
    ["pap-109", "pap-13"], ["pap-109", "pap-12"], ["pap-110", "pap-11"], ["pap-110", "pap-1"],
  ];
  coreCitations.forEach(([s, t]) => addEdge({ id: eid(), source: s, target: t, type: "CITES" }));

  for (let i = 26; i <= 110; i++) {
    const target1 = `pap-${((i * 3) % 25) + 1}`;
    const target2 = `pap-${Math.max(1, i - 7)}`;
    addEdge({ id: eid(), source: `pap-${i}`, target: target1, type: "CITES" });
    if (i > 30) addEdge({ id: eid(), source: `pap-${i}`, target: target2, type: "CITES" });
  }

  // 7. Research Projects (16)
  const projectNames = [
    { name: "Project Helix", desc: "Frontier Foundation Models", status: "Active" },
    { name: "NeuroGraph Initiative", desc: "Geometric Graph Architectures", status: "Active" },
    { name: "OpenKnowledge", desc: "Cross-domain Knowledge Graphs", status: "Active" },
    { name: "DeepReason", desc: "Neurosymbolic Inference Engine", status: "Active" },
    { name: "GraphAI Consortium", desc: "Standardizing GNN Accelerators", status: "Completed" },
    { name: "Federated Health AI", desc: "Privacy-Preserving Hospital Collaborations", status: "Active" },
    { name: "ClimateNLP", desc: "Climate Science Information Extraction", status: "Active" },
    { name: "RoboLearn", desc: "Generalist Vision-Language-Action Embodiments", status: "Active" },
    { name: "EthicsEngine", desc: "Autonomous Alignment and Rule Verification", status: "Planning" },
    { name: "SciDiscover", desc: "AI-accelerated Automated Hypothesis Generation", status: "Active" },
    { name: "Language Bridge", desc: "Cross-lingual Low-resource Representation", status: "Active" },
    { name: "VisionForge", desc: "3D Radiance Field Scene Reconstruction", status: "Active" },
    { name: "CareGraph", desc: "Biomedical Clinical Knowledge Network", status: "Active" },
    { name: "MolecularAI", desc: "Graph Diffusion for Drug Screening", status: "Active" },
    { name: "UrbanFlow", desc: "Spatial Graph Neural Networks for Mobility", status: "Completed" },
    { name: "Superalignment Labs", desc: "Scalable Automated Oversight for Superhuman Models", status: "Active" },
  ];

  projectNames.forEach((proj, idx) => {
    addNode({
      id: `proj-${idx + 1}`,
      type: "ResearchProject",
      label: proj.name,
      properties: {
        id: `proj-${idx + 1}`,
        name: proj.name,
        description: proj.desc,
        status: proj.status,
      },
    });
  });

  return { nodes: getAllNodes().length, edges: getAllEdges().length };
}
