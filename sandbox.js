import path from "node:path";
import { Sandbox } from "v8-sandbox";

const timeout = 3 * 1000;

const globals = {
  testing: Math.PI
};

const template = "function $(_) { return setResult({ result: _ }); }";

async function executeCode(code) {
  const sandbox = new Sandbox({
    template,
    require: path.join(process.cwd(), 'sandbox-functions.js')
  });

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
