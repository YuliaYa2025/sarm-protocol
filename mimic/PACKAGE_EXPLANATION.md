# Mimic Protocol Packages Explained

## Three Different Packages

Mimic Protocol has **three separate packages** with different purposes:

### 1. `@mimicprotocol/cli` - Command Line Tool
**Installation:**
```bash
npm install -g @mimicprotocol/cli
# or
yarn global add @mimicprotocol/cli
```

**Purpose:**
- Command-line tool for interacting with Mimic Protocol
- Provides commands like `mimic compile`, `mimic deploy`, etc.
- Installed **globally** (`-g` flag) so it's available system-wide
- Similar to tools like `git`, `npm`, or `forge`

**Usage:**
```bash
mimic --version
mimic compile task.ts
mimic deploy task.ts --key YOUR_KEY
```

**When to use:**
- Compiling tasks to WASM
- Deploying tasks via CLI
- Quick commands without writing code

---

### 2. `@mimicprotocol/sdk` - TypeScript SDK
**Installation:**
```bash
npm install @mimicprotocol/sdk
# or
yarn add @mimicprotocol/sdk
```

**Purpose:**
- TypeScript client library for Mimic Protocol API
- Used in your **application code** (like `deploy.ts`)
- Installed **locally** in your project (no `-g` flag)
- Provides programmatic access to Mimic's API

**Usage:**
```typescript
import { Client, ApiKeyAuth } from '@mimicprotocol/sdk'

const client = new Client({
  auth: new ApiKeyAuth('your-key')
})

const tasks = await client.tasks.get()
const config = await client.configs.signAndCreate({...})
```

**When to use:**
- Building deployment scripts
- Programmatic task management
- Integration with CI/CD
- Custom tooling

---

### 3. `@mimicprotocol/lib-ts` - Task Code Library
**Installation:**
```bash
npm install @mimicprotocol/lib-ts
# or
yarn add @mimicprotocol/lib-ts
```

**Purpose:**
- TypeScript library for **writing task code** (your `task.ts` file)
- Gets compiled to WASM and runs on Mimic's network
- Installed **locally** in your project
- Provides APIs for creating intents, accessing oracles, etc.

**Usage:**
```typescript
import { EvmCall, Transfer, log } from '@mimicprotocol/lib-ts'

export default function main(): void {
  // Your task logic here
  EvmCall.create({...}).send()
}
```

**When to use:**
- Writing task code that runs on Mimic network
- Creating intents (transfers, swaps, contract calls)
- Accessing oracle data

---

## Comparison Table

| Package | Installation | Location | Purpose | Used In |
|---------|-------------|----------|---------|---------|
| `@mimicprotocol/cli` | `npm install -g` | Global | CLI tool | Terminal commands |
| `@mimicprotocol/sdk` | `npm install` | Local | API client | Deployment scripts |
| `@mimicprotocol/lib-ts` | `npm install` | Local | Task library | Task code (`task.ts`) |

## Installation Commands

### For Your Project:

```bash
cd mimic

# Install local packages (for your code)
npm install @mimicprotocol/lib-ts @mimicprotocol/sdk

# Install CLI globally (for commands)
npm install -g @mimicprotocol/cli
```

### Using Yarn:

```bash
cd mimic

# Install local packages
yarn add @mimicprotocol/lib-ts @mimicprotocol/sdk

# Install CLI globally
yarn global add @mimicprotocol/cli
```

## Key Differences

### `npm install -g` vs `npm install` (no `-g`)

**Global (`-g`):**
- Installs package system-wide
- Available from any directory
- Used for command-line tools
- Example: `npm install -g @mimicprotocol/cli`

**Local (no `-g`):**
- Installs package in current project
- Only available in that project
- Used for libraries your code imports
- Example: `npm install @mimicprotocol/sdk`

### `npm` vs `yarn`

Both are package managers. They do the same thing, just different commands:

| npm | yarn |
|-----|------|
| `npm install` | `yarn add` |
| `npm install -g` | `yarn global add` |
| `npm run` | `yarn run` |

**Use whichever you prefer** - both work the same way.

## For Your Project

You need **all three**:

```bash
# 1. CLI (global) - for commands
npm install -g @mimicprotocol/cli

# 2. SDK (local) - for deploy.ts
npm install @mimicprotocol/sdk

# 3. Library (local) - for task.ts
npm install @mimicprotocol/lib-ts
```

Or use yarn:

```bash
# 1. CLI (global)
yarn global add @mimicprotocol/cli

# 2. SDK (local)
yarn add @mimicprotocol/sdk

# 3. Library (local)
yarn add @mimicprotocol/lib-ts
```

## Summary

- **`@mimicprotocol/cli`** = Command-line tool (global install)
- **`@mimicprotocol/sdk`** = API client library (local install)
- **`@mimicprotocol/lib-ts`** = Task code library (local install)
- **`npm` vs `yarn`** = Different package managers, same functionality

