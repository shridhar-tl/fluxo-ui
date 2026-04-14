export const sampleOld = `function greet(name) {
    console.log("Hello, " + name);
}

function add(a, b) {
    return a + b;
}

const PI = 3.14;
const E = 2.71;

greet("World");
console.log(add(2, 3));
`;

export const sampleNew = `function greet(name, greeting = "Hello") {
    console.log(\`\${greeting}, \${name}!\`);
}

function add(a, b) {
    return Number(a) + Number(b);
}

const PI = 3.14159;
const TAU = 6.28318;

greet("World");
greet("Friend", "Hi");
console.log(add(2, 3));
`;

const makeLargeBlock = (seed: number) => {
    const lines: string[] = [];
    for (let i = 0; i < 2000; i++) {
        const n = (i * 37 + seed) % 97;
        lines.push(`line ${i.toString().padStart(5, '0')} — value=${n} tag=alpha_${n % 10}`);
    }
    return lines.join('\n');
};

export const largeOld = makeLargeBlock(1);
export const largeNew = (() => {
    const lines = makeLargeBlock(1).split('\n');
    for (let i = 50; i < lines.length; i += 73) lines[i] = lines[i].replace('alpha', 'beta');
    lines.splice(120, 0, 'INSERTED LINE A', 'INSERTED LINE B');
    lines.splice(900, 2);
    return lines.join('\n');
})();
