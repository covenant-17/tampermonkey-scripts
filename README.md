# tampermonkey-scripts

A collection of Tampermonkey userscripts to enhance web browsing experience.

## What can this repository do?

This repository serves as a centralized collection of userscripts for the Tampermonkey browser extension. With these scripts, you can:

### 🚀 **Enhance Web Functionality**
- Modify website behavior and appearance
- Add missing features to websites
- Automate repetitive web tasks
- Improve accessibility and user experience

### 📝 **Script Management**
- Store and organize your custom userscripts
- Version control your script modifications
- Share useful scripts with the community
- Collaborate on script development

### 🛠️ **Development Features**
- Easy script deployment and testing
- Structured organization for multiple scripts
- Documentation and examples for common use cases
- Best practices for userscript development

## Repository Structure

- `scripts/` - Public Tampermonkey scripts
  - `examples/` - Example scripts for learning
  - `utilities/` - Utility scripts for common tasks
- `scripts-private/` - Private scripts (Git submodule, optional)

## Getting Started

### Installation Options

**Option 1: Clone public scripts only**
```bash
git clone https://github.com/covenant-17/tampermonkey-scripts.git
```

**Option 2: Clone with private scripts (requires access)**
```bash
git clone --recurse-submodules https://github.com/covenant-17/tampermonkey-scripts.git
```

**Option 3: Add private scripts submodule to existing clone**
```bash
cd tampermonkey-scripts
git submodule add https://github.com/YOUR-USERNAME/tampermonkey-private-scripts.git scripts-private
git submodule update --init --recursive
```

### Using Scripts

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Browse the scripts in this repository
3. Copy the script content and create a new userscript in Tampermonkey
4. Enable the script and enjoy enhanced web browsing!

## Contributing

Feel free to contribute your own userscripts or improvements to existing ones. Make sure to:
- Follow userscript best practices
- Include proper metadata headers
- Document what the script does
- Test thoroughly before submitting