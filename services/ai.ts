export class AIService {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2-27b-it';
  private static readonly API_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;

  static async generateResponse(
    messages: Array<{ role: string; content: string }>,
    quickAction?: string
  ): Promise<string> {
    try {
      // Prepare the conversation for the model
      let systemPrompt = 'You are a helpful AI tutor. Provide clear, educational responses that help students learn effectively.';
      
      if (quickAction) {
        switch (quickAction) {
          case 'explain-simply':
            systemPrompt += ' Please explain this concept in simple terms that are easy to understand.';
            break;
          case 'give-examples':
            systemPrompt += ' Please provide practical examples to illustrate this concept.';
            break;
          case 'quiz-me':
            systemPrompt += ' Please create a quiz question or practice problem based on this topic.';
            break;
        }
      }

      // Format messages for the model
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      // For demo purposes, we'll simulate an AI response
      // In a real app, you'd integrate with the actual Hugging Face API
      return this.simulateAIResponse(messages[messages.length - 1]?.content || '', quickAction);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  private static simulateAIResponse(userMessage: string, quickAction?: string): string {
    const responses = {
      'explain-simply': [
        `Let me break down "${userMessage}" in simple terms:\n\nThink of it like building with blocks - each concept builds on the previous one. The key idea here is understanding the foundation first, then adding complexity step by step.`,
        `Great question! Here's a simple way to think about "${userMessage}":\n\nImagine you're explaining this to a friend who's never heard of it before. The core concept is really about connecting ideas in a logical way.`
      ],
      'give-examples': [
        `Here are some practical examples for "${userMessage}":\n\n1. **Real-world example**: Like organizing your music playlist - you group similar songs together\n2. **Everyday analogy**: Think of it like following a recipe - each step builds on the previous one\n3. **Visual example**: Picture a tree where the trunk is the main idea and branches are related concepts`,
        `Let me give you concrete examples of "${userMessage}":\n\n• **Example 1**: In daily life, this is like planning your route to work - you consider traffic, time, and efficiency\n• **Example 2**: It's similar to organizing your closet - grouping similar items makes everything easier to find\n• **Example 3**: Think of learning to drive - you master basics before advanced techniques`
      ],
      'quiz-me': [
        `Great! Let's test your understanding of "${userMessage}" with a quick quiz:\n\n**Question**: Can you explain the key principle behind this concept in your own words?\n\n**Bonus challenge**: How would you apply this in a real-world scenario?\n\nTake your time and let me know your thoughts!`,
        `Perfect timing for a quiz! Based on our discussion about "${userMessage}":\n\n**Question 1**: What's the most important aspect to remember about this topic?\n\n**Question 2**: Can you think of a situation where you might use this knowledge?\n\nFeel free to answer one or both - I'm here to help guide you through it!`
      ],
      'default': [
        `That's an excellent question about "${userMessage}"! Let me help you understand this better.\n\nThe key insight here is that learning happens best when we connect new information to what we already know. Think of your brain as building a network of knowledge - each new concept creates stronger connections when it relates to familiar ideas.\n\nWould you like me to explain this more simply, give you some examples, or create a practice question?`,
        `I'm glad you're exploring "${userMessage}"! This is actually a really important concept to master.\n\nHere's what I want you to focus on: understanding the 'why' behind the concept, not just the 'what'. When you grasp the underlying principles, everything else becomes much clearer.\n\nWhat specific aspect would you like to dive deeper into?`,
        `Great topic to study! "${userMessage}" is one of those concepts that really clicks once you see how it connects to other ideas.\n\nLet me share a key insight: the best way to learn this is through active practice and real-world application. Theory is important, but seeing how it works in practice makes all the difference.\n\nShould we work through some examples together?`
      ]
    };

    const categoryResponses = responses[quickAction as keyof typeof responses] || responses.default;
    const randomIndex = Math.floor(Math.random() * categoryResponses.length);
    return categoryResponses[randomIndex];
  }

  static extractKeyPoints(content: string): string[] {
    // Simple extraction logic - in a real app, you might use more sophisticated NLP
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints: string[] = [];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Look for educational indicators
      if (trimmed.includes('key') || 
          trimmed.includes('important') || 
          trimmed.includes('remember') ||
          trimmed.includes('concept') ||
          trimmed.length > 50) {
        keyPoints.push(trimmed);
      }
    });

    return keyPoints.slice(0, 3); // Limit to 3 key points
  }

  static extractTopic(content: string): string {
    // Simple topic extraction - first few words or key concepts
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    return meaningfulWords.slice(0, 2).join(' ') || 'General Discussion';
  }
}