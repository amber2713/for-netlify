const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface GenerateCharacterRequest {
  traits: string[];
}

interface BailianResponse {
  output?: {
    task_id?: string;
    task_status?: string;
    results?: Array<{
      url?: string;
    }>;
  };
  request_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // 从环境变量获取API密钥（不允许 fallback）
    const BAILIAN_API_KEY = Deno.env.get('BAILIAN_API_KEY');
    if (!BAILIAN_API_KEY) {
      throw new Error('Missing BAILIAN_API_KEY in environment variables.');
    }

    const { traits }: GenerateCharacterRequest = await req.json();

    if (!traits || traits.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Please provide exactly 3 traits" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const characterDescription = `A digital character with these traits: ${traits.join(', ')}. Create a futuristic, digital art style portrait with cyberpunk aesthetics, neon colors, and technological elements.`;

    const imageResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BAILIAN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx2.1-t2i-turbo',
        input: {
          prompt: characterDescription,
          negative_prompt: 'blurry, low quality, distorted, ugly',
          style: 'digital art, cyberpunk, futuristic'
        },
        parameters: {
          size: '512*512',
          n: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });

    const imageResult: BailianResponse = await imageResponse.json();

    if (!imageResult.output?.task_id) {
      throw new Error('Failed to initiate image generation');
    }

    let imageUrl = '';
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts && !imageUrl) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${imageResult.output.task_id}`, {
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`
        }
      });

      const statusResult: BailianResponse = await statusResponse.json();

      if (statusResult.output?.task_status === 'SUCCEEDED' && statusResult.output.results?.[0]?.url) {
        imageUrl = statusResult.output.results[0].url;
        break;
      } else if (statusResult.output?.task_status === 'FAILED') {
        throw new Error('Image generation failed');
      }

      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Image generation timeout');
    }

    const poemPrompts = traits.map(trait =>
      `Write a short, elegant poem about the character trait "${trait}" in a digital/cyberpunk context. Keep it to 3 lines maximum.`
    );

    const poems = [];
    for (const prompt of poemPrompts) {
      const poemResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            max_tokens: 100,
            temperature: 0.8
          }
        })
      });

      const poemResult = await poemResponse.json();
      if (poemResult.output?.choices?.[0]?.message?.content) {
        poems.push(poemResult.output.choices[0].message.content.trim());
      } else {
        poems.push(`In digital realms where ${prompt} shines bright,\nThrough circuits deep and data streams of light,\nA character born from code's pure sight.`);
      }
    }

    return new Response(
      JSON.stringify({
        image: imageUrl,
        poems: poems
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error generating character:', error);

    const fallbackImages = [
      'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=1',
      'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=1',
      'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=1'
    ];

    return new Response(
      JSON.stringify({
        image: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
        poems: [
          'In digital realms where pixels dance and gleam,\nA character born from data\'s dream,\nWith essence bright, it stands supreme.',
          'Through circuits deep and streams so wide,\nVirtual souls in code reside,\nIn cyber worlds where dreams collide.',
          'Behold the spirit, pure and true,\nIn bytes and bits, a being new,\nA digital soul, me and you.'
        ],
        fallback: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});