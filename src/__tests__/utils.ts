import * as path from "path";
import * as fs from "fs-extra";
import {
  Exports,
  Imports,
  findPathInExports,
  findEntryInExports,
} from "../index";

// avoid cache
let id = 0;

const createNodeTestEnv = (
  type: "exports" | "imports",
  obj: Exports | Imports,
  dest: string | null
) => {
  const name = "demo" + ++id;
  const nodeModules = path.resolve(__dirname, "./node_modules");
  const dir = path.resolve(nodeModules, name);
  const jsonDir = path.resolve(dir, "./package.json");

  if (fs.existsSync(nodeModules)) {
    fs.removeSync(nodeModules);
  }
  fs.ensureFileSync(jsonDir);
  fs.writeFileSync(jsonDir, JSON.stringify({ name, [type]: obj }, null, 2));
  if (dest !== null) {
    dest = path.resolve(dir, dest);
    dest.endsWith("/") ? fs.ensureDirSync(dest) : fs.ensureFileSync(dest);
  }
  return {
    dir,
    name,
    remove: () => fs.removeSync(nodeModules),
  };
};

const resolvePath = (input: string, name: string) => {
  return require.resolve(name + input.slice(1));
};

export const checkFindPath = (
  input: string,
  exps: Exports,
  value: string | null,
  conditions?: Array<string>
) => {
  // check nodeJs behavior
  const { dir, name, remove } = createNodeTestEnv("exports", exps, value);
  if (value === null) {
    expect(() => resolvePath(input, name)).toThrow();
  } else {
    expect(resolvePath(input, name)).toBe(path.resolve(dir, value));
  }
  remove();
  // check customize behavior
  expect(findPathInExports(input, exps, conditions)).toBe(value);
};

export const checkFindEntry = (
  exps: Exports,
  value: string | null,
  conditions?: Array<string>
) => {
  // check nodeJs behavior
  const { dir, name, remove } = createNodeTestEnv("exports", exps, value);
  if (value === null) {
    expect(() => resolvePath(".", name)).toThrow();
  } else {
    expect(resolvePath(".", name)).toBe(path.resolve(dir, value));
  }
  remove();
  // check customize behavior
  expect(findEntryInExports(exps, conditions)).toBe(value);
};
