# How to Install Node.js (Required for npm)

## The Error You're Seeing

```
zsh: command not found: npm
```

This means **Node.js is not installed** on your computer. Node.js includes `npm` (Node Package Manager), which is needed to install project dependencies.

## Solution: Install Node.js

### On Mac (Easiest Method)

1. **Go to:** https://nodejs.org/
2. **Download the LTS version** (Long Term Support - recommended)
3. **Run the installer** (`.pkg` file)
4. **Follow the installation wizard**
5. **Restart your Terminal**
6. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

### On Mac (Using Homebrew)

If you have Homebrew installed:

```bash
brew install node
```

Then verify:
```bash
node --version
npm --version
```

### On Windows

1. **Go to:** https://nodejs.org/
2. **Download the LTS version** for Windows
3. **Run the installer** (`.msi` file)
4. **Follow the installation wizard**
5. **Restart Command Prompt/PowerShell**
6. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

### On Linux

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Or use package manager:**
```bash
sudo apt update
sudo apt install nodejs npm
```

## After Installation

1. **Close and reopen your Terminal/Command Prompt**
2. **Navigate back to your project:**
   ```bash
   cd ~/Documents/Vapi_knowledgebase/vapi-knowledge-base
   ```
3. **Now try npm install again:**
   ```bash
   npm install
   ```

## Verify Installation

After installing, run these commands to verify:

```bash
node --version   # Should show something like v20.x.x
npm --version    # Should show something like 10.x.x
```

If both commands show version numbers, you're good to go! ✅

## What Node.js Version Do You Need?

- **Minimum:** Node.js v16 or higher
- **Recommended:** Node.js v20 LTS (Long Term Support)

## Troubleshooting

### After installing, still says "command not found"

1. **Close and reopen Terminal** completely
2. **Check if Node.js is in your PATH:**
   ```bash
   which node    # Mac/Linux
   where node    # Windows
   ```

### Installation seems successful but npm still doesn't work

- Try restarting your computer
- Make sure you downloaded from the official website: https://nodejs.org/

## Next Steps

Once Node.js is installed:

```bash
cd ~/Documents/Vapi_knowledgebase/vapi-knowledge-base
npm install
```

Then continue with the setup guide!

