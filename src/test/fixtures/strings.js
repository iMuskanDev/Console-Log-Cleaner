const logMethod = "console.log('hello')";
const templateLog = `
Line 1: console.log("demo")
Line 2
`;
const obj = { console: { log: "not a function" } };
const fakeText = "console.log";
console.log("Real log statement");
