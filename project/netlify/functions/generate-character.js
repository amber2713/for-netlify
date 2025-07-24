import fetch from 'node-fetch';

export async function handler(event, context) {
  console.log('Function called with method:', event.httpMethod);
  console.log('Function called with headers:', event.headers);
  
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Processing POST request');
    // 从环境变量获取API密钥
    const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY;
    console.log('API Key available:', !!BAILIAN_API_KEY);
    
    const { traits } = JSON.parse(event.body);
    console.log('Received traits:', traits);
    
    if (!traits || traits.length !== 3) {
      console.log('Invalid traits provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Please provide exactly 3 traits" }),
      };
    }

    console.log('Generating character with traits:', traits);

    // 构建角色描述
    const characterDescription = `A digital character with these traits: ${traits.join(', ')}. Create a futuristic, digital art style portrait with cyberpunk aesthetics, neon colors, and technological elements.`;

    // 调用百炼大模型API生成图片
    console.log('Calling image generation API...');
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

    const imageResult = await imageResponse.json();
    console.log('Image API response:', imageResult);
    
    if (!imageResult.output?.task_id) {
      console.error('Failed to get task_id:', imageResult);
      throw new Error('Failed to initiate image generation: ' + JSON.stringify(imageResult));
    }

    // 轮询获取图片生成结果
    console.log('Polling for image result...');
    let imageUrl = '';
    let attempts = 0;
    const maxAttempts = 30; // 最多等待30秒

    while (attempts < maxAttempts && !imageUrl) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
      
      const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${imageResult.output.task_id}`, {
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`
        }
      });

      const statusResult = await statusResponse.json();
      console.log(`Attempt ${attempts + 1}, status:`, statusResult.output?.task_status);
      
      if (statusResult.output?.task_status === 'SUCCEEDED' && statusResult.output.results?.[0]?.url) {
        imageUrl = statusResult.output.results[0].url;
        console.log('Image generated successfully:', imageUrl);
        break;
      } else if (statusResult.output?.task_status === 'FAILED') {
        throw new Error('Image generation failed: ' + JSON.stringify(statusResult));
      }
      
      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Image generation timeout after 30 seconds');
    }

    // 使用百炼大模型生成诗歌
    console.log('Generating poems...');
    const poems = [];
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      const prompt = `Write a short, elegant poem about the character trait "${trait}" in a digital/cyberpunk context. Keep it to 3 lines maximum.`;
      
      try {
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
          // 备用诗歌
          poems.push(`In digital realms where ${trait} shines bright,\nThrough circuits deep and data streams of light,\nA character born from code's pure sight.`);
        }
      } catch (error) {
        console.error(`Error generating poem for trait ${trait}:`, error);
        // 备用诗歌
        poems.push(`In digital realms where ${trait} shines bright,\nThrough circuits deep and data streams of light,\nA character born from code's pure sight.`);
      }
    }

    console.log('Character generation completed successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        image: imageUrl,
        poems: poems
      }),
    };

  } catch (error) {
    console.error('Error generating character:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate character',
        details: error.message
      }),
    };
  }
};
