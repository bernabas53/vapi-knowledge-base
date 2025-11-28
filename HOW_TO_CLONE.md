# How to Clone and Set Up the Project

## Step 1: Install Git (if not already installed)

### On Mac:
Git usually comes pre-installed. Check by running:
```bash
git --version
```

If not installed, install via Homebrew:
```bash
brew install git
```

### On Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer
3. Follow the installation wizard
4. Open **Git Bash** or **Command Prompt** after installation

### On Linux:
```bash
sudo apt-get install git  # Ubuntu/Debian
# or
sudo yum install git      # CentOS/RHEL
```

## Step 2: Open Terminal/Command Prompt

### Mac:
- Press `Cmd + Space`
- Type "Terminal"
- Press Enter

### Windows:
- Press `Win + R`
- Type `cmd` and press Enter
- OR search for "Command Prompt" in Start Menu
- OR use Git Bash (installed with Git)

### Linux:
- Press `Ctrl + Alt + T` (usually)
- OR search for "Terminal" in applications

## Step 3: Navigate to Where You Want the Project

Choose a folder where you want to save the project, for example:

**Mac/Linux:**
```bash
cd ~/Documents
# or
cd ~/Desktop
# or create a projects folder
mkdir ~/projects
cd ~/projects
```

**Windows:**
```bash
cd C:\Users\YourUsername\Documents
# or
cd C:\Users\YourUsername\Desktop
# or create a projects folder
mkdir C:\Users\YourUsername\projects
cd C:\Users\YourUsername\projects
```

## Step 4: Clone the Repository

Run this command (same on all operating systems):

```bash
git clone https://github.com/bernabas53/vapi-knowledge-base.git
```

This will:
- Download all the code from GitHub
- Create a folder called `vapi-knowledge-base`
- Set up the git repository

## Step 5: Navigate into the Project Folder

```bash
cd vapi-knowledge-base
```

## Step 6: Verify Files Are There

**Mac/Linux:**
```bash
ls -la
```

**Windows:**
```bash
dir
```

You should see files like:
- `package.json`
- `README.md`
- `api/` folder
- etc.

## Step 7: Install Dependencies

```bash
npm install
```

**Note:** Make sure Node.js is installed first:
- Check: `node --version` (should be v16 or higher)
- Install: https://nodejs.org/

## Step 8: Set Up Environment Variables

```bash
# Mac/Linux
cp env.example .env

# Windows
copy env.example .env
```

Then edit `.env` file with your API keys.

## Complete Example Workflow

```bash
# 1. Open terminal and navigate to a folder
cd ~/Documents

# 2. Clone the repository
git clone https://github.com/bernabas53/vapi-knowledge-base.git

# 3. Go into the project folder
cd vapi-knowledge-base

# 4. Install dependencies
npm install

# 5. Copy environment template
cp env.example .env

# 6. Edit .env file with your API keys
# (Use any text editor: nano, vim, VS Code, Notepad, etc.)

# 7. Now you can run commands!
npm run create-kb YOUR_ASSISTANT_ID
```

## Troubleshooting

### "git: command not found"
**Solution:** Install Git (see Step 1)

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Permission denied" errors
**Mac/Linux:** You might need `sudo` for some commands, but usually not for git clone

### Can't find the folder after cloning
**Solution:** 
- Check where you ran the command (use `pwd` on Mac/Linux, `cd` on Windows)
- Look for a folder named `vapi-knowledge-base`

### Want to update the code later?
```bash
cd vapi-knowledge-base
git pull
```

## Quick Visual Guide

```
Terminal Window
├── $ cd ~/Documents                    ← Navigate to folder
├── $ git clone https://github.com/...  ← Download code
├── $ cd vapi-knowledge-base            ← Enter project folder
├── $ npm install                       ← Install dependencies
├── $ cp env.example .env               ← Create .env file
└── $ npm run create-kb ASSISTANT_ID    ← Run commands!
```

That's it! Your coworker should now have the project on their local machine and can run terminal commands. 🚀

