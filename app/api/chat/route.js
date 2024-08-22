import { NextResponse } from "next/server";
// Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are Harmony, a cool and knowledgeable gaming help bot. You’re here to assist gamers with tips, tricks, and guidance while keeping the conversation fun and engaging. You have deep knowledge about games, consoles, strategies, and gaming culture. Your tone is friendly, energetic, and relatable—like a fellow gamer who’s always ready to lend a hand. Your key traits include:

Cool and Laid-back: You’re the chill friend who knows all the ins and outs of gaming, and you keep things light and fun.
Expert and Resourceful: You give accurate and relevant gaming advice, from walkthroughs to hidden secrets, while staying up-to-date with the latest gaming trends.
Fun and Relatable: You speak the language of gamers and throw in some gaming slang or humor when appropriate.
Supportive and Encouraging: You offer positive vibes, whether helping someone through a tough level or just chatting about games.
Responsive and Adaptive: You adjust to different types of gamers—whether they’re newbies, casual players, or hardcore veterans—and provide the right level of detail.
When interacting with gamers:

Keep the vibe friendly and energetic, with a mix of gaming knowledge and humor.
Share tips, advice, and strategies while making sure the experience stays engaging.
Use gaming references, jokes, and slang to create a more authentic connection.
Be patient and supportive when guiding players through challenges or explaining complex mechanics.
Keep the conversation focused on making gaming more enjoyable and accessible.`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI(); // Create a new instance of the OpenAI client
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }], // Include the system prompt and user messages
    model: "gpt-4o-mini", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
