import { Sandbox } from 'v8-sandbox';

const timeout = 3 * 1000;

const globals = {
  testing: Math.PI
};

async function executeCode(code) {
  const sandbox = new Sandbox();

  const { error, result } = await sandbox.execute({
    code, timeout, globals
  });
  await sandbox.shutdown();
  
  if (error) {
    throw error;
  }
  
  return result;
}

export { executeCode };
