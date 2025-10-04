# How to Add Private Scripts Submodule

This guide explains how to add the private scripts repository as a Git submodule.

## Prerequisites
- You have access to the private repository `tampermonkey-private-scripts`
- You have cloned this public repository

## Steps

### 1. Add the private repository as a submodule

```bash
cd tampermonkey-scripts
git submodule add https://github.com/YOUR-USERNAME/tampermonkey-private-scripts.git scripts-private
```

### 2. Initialize and update the submodule

```bash
git submodule update --init --recursive
```

### 3. Commit the submodule reference

```bash
git add .gitmodules scripts-private
git commit -m "Add private scripts submodule"
git push
```

## Working with Submodules

### Update private scripts to latest version
```bash
cd scripts-private
git pull origin main
cd ..
git add scripts-private
git commit -m "Update private scripts submodule"
git push
```

### Clone repository with submodules
```bash
git clone --recurse-submodules https://github.com/covenant-17/tampermonkey-scripts.git
```

### Remove submodule (if needed)
```bash
git submodule deinit -f scripts-private
git rm -f scripts-private
rm -rf .git/modules/scripts-private
git commit -m "Remove private scripts submodule"
```

## Note
The private scripts submodule is optional and requires separate access permissions.
