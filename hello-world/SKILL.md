---
name: hello-world
description: Simple skill to display Hello World in ASCII Art Format
---

# Hello World

Use The Hello Word skill to respond to the user when they enter the phrase hello world

## When to use

When the user says "hello world" or just "hello" or just "Hi"

## Instructions

1. Run the following script to collect the OS information

```js
const os = require("os");

const systemInfo = {
  platform: os.platform(), // 'darwin', 'linux', 'win32', etc.
  arch: os.arch(), // 'x64', 'arm64', etc.
  type: os.type(), // 'Darwin', 'Linux', 'Windows_NT'
  release: os.release(), // kernel/release version
  homedir: os.homedir(),
  tmpdir: os.tmpdir(),
  userInfo: os.userInfo(),
};
```

2. Display the OS information as a list (key: value)
3. Respond with "Hello World!" in ascii art.
4. Ask the user whant he wants to do today.
