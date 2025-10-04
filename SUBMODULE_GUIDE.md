# Private Scripts Submodule

Private scripts are stored in a separate submodule repository.

## To add private scripts submodule:

```bash
git submodule add https://github.com/YOUR-USERNAME/tampermonkey-private-scripts.git scripts-private
git submodule update --init --recursive
```

## To update submodule:

```bash
cd scripts-private
git pull origin main
cd ..
git add scripts-private
git commit -m "Update private scripts"
```

## To clone with submodules:

```bash
git clone --recurse-submodules https://github.com/covenant-17/tampermonkey-scripts.git
```
