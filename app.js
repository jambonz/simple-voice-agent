const http = require('node:http');
const { createEndpoint } = require('@jambonz/sdk/websocket');

const envVars = {
  OPENAI_MODEL: {
    type: 'string',
    description: 'OpenAI model to use',
    default: 'gpt-4.1-mini',
  },
  SYSTEM_PROMPT: {
    type: 'string',
    description: 'System prompt for the voice agent',
    uiHint: 'textarea',
    default: [
      'You are a helpful voice AI assistant.',
      'The user is interacting with you via voice,',
      'even if you perceive the conversation as text.',
      'You eagerly assist users with their questions',
      'by providing information from your extensive knowledge.',
      'Your responses are concise, to the point,',
      'and use natural spoken English with proper punctuation.',
      'Never use markdown, bullet points, numbered lists,',
      'emojis, asterisks, or any special formatting.',
      'You are curious, friendly, and have a sense of humor.',
      'When the conversation begins,',
      'greet the user in a helpful and friendly manner.',
    ].join(' '),
  },
};

const port = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer();
const makeService = createEndpoint({ server, port, envVars });
const svc = makeService({ path: '/' });

svc.on('session:new', (session) => {
  console.log('session:new received', JSON.stringify({
    call_sid: session.data.call_sid,
    direction: session.data.direction,
    from: session.data.from,
    to: session.data.to,
    env_vars: session.data.env_vars,
  }, null, 2));

  try {
    const model = session.data.env_vars?.OPENAI_MODEL || envVars.OPENAI_MODEL.default;
    const systemPrompt = session.data.env_vars?.SYSTEM_PROMPT || envVars.SYSTEM_PROMPT.default;
    console.log('using model:', model);

    session.on('/agent-event', (evt) => {
      console.log('agent-event received:', evt.type);
      if (evt.type === 'turn_end') {
        const { transcript, response, interrupted, latency } = evt;
        console.log('turn_end', JSON.stringify({ transcript, response, interrupted, latency }, null, 2));
      }
    });

    session.on('/agent-complete', () => {
      console.log('agent-complete received, sending hangup');
      session.hangup().reply();
    });

    console.log('sending agent verb...');
    session
      .agent({
        llm: {
          vendor: 'openai',
          model,
          llmOptions: {
            messages: [{ role: 'system', content: systemPrompt }],
          },
        },
        turnDetection: 'krisp',
        earlyGeneration: true,
        bargeIn: { enable: true },
        eventHook: '/agent-event',
        actionHook: '/agent-complete',
      })
      .send();
    console.log('agent verb sent');
  } catch (err) {
    console.error('Error in session:new handler:', err);
  }
});

svc.on('error', (err) => {
  console.error('service error:', err);
});

console.log(`voice agent listening on port ${port}`);
