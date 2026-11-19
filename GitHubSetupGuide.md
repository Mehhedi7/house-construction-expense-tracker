# How to Put the Project on GitHub – Very Simple, Tiny Steps

Below is a **break‑down of the single command you saw earlier** into a handful of tiny actions with explanations. You can follow each line *one at a time* in a Windows command prompt (or PowerShell).

---

## 1️⃣ Open the GitHub website and create an **empty** repository
1. Go to **https://github.com** and sign in (or create a free account).
2. Click the **+** button in the top‑right corner → **New repository**.
3. Fill in:
   - **Repository name**: `house-construction-expense-tracker`
   - Keep **Public** (or Private if you prefer).  
   - **Do NOT** tick *Initialize this repository with a README* – we will push our own files.
4. Click **Create repository**.
   - GitHub now shows you a page that says *“Quick setup — if you’ve done this kind of thing before”* with a URL that looks like:
   ```
   https://github.com/your‑username/house-construction-expense-tracker.git
   ```
   
   **Save that URL** – you’ll need it in the next step.

---

## 2️⃣ Open a terminal (PowerShell) on your computer
1. Press **Win + R**, type `powershell`, and press **Enter**.
2. You’ll see a black window that ends with something like `PS C:\Users\User>` – that’s where you type commands.

---

## 3️⃣ Go to the folder that already contains the project files
The files were generated in the Antigravity *scratch* folder. Run the `cd` (change‑directory) command **exactly** as shown, then press **Enter**:

```powershell
cd C:\Users\User\.gemini\antigravity\scratch\house-construction-expense-tracker
```

If the path is wrong you’ll get an error like *“The system cannot find the path specified.”* – double‑check the spelling and that the folder exists.

---

## 4️⃣ Initialise a local Git repository in that folder
```powershell
git init
```
*What this does:* creates a hidden `.git` folder that tells Git “this directory is a repository”. You should see a short message like `Initialized empty Git repository in …\.git\`.

---

## 5️⃣ Add **all** the files to the first commit
```powershell
git add .
```
The dot (`.`) means “the current folder and everything inside it”. Git now tracks every file.

---

## 6️⃣ Record the first snapshot (the *commit*)
```powershell
git commit -m "initial commit"
```
Git opens a tiny editor to confirm the commit message, but because we gave `-m` it just creates the commit immediately.

---

## 7️⃣ Name the default branch **main** (GitHub’s preferred name)
```powershell
git branch -M main
```
Now the local branch is called `main`.

---

## 8️⃣ Connect your local repo to the **remote** repository on GitHub
Replace `<your‑username>` with the username you used on GitHub (or the organization name if you created it there):

```powershell
git remote add origin https://github.com/<your‑username>/house-construction-expense-tracker.git
```
You can verify the remote with:
```powershell
git remote -v
```
It should list `origin` pointing to the URL you just typed.

---

## 9️⃣ **Push** the code to GitHub for the first time
```powershell
git push -u origin main
```
* What happens:
  * Git uploads all the files to the remote repository.
  * The `-u` flag tells Git to remember that `origin/main` is the default upstream for future `git push`/`git pull` commands.
* You’ll be prompted for your GitHub username and **personal access token** (PAT) the first time:
  * Create a token at **GitHub → Settings → Developer settings → Personal access tokens → Generate new token**. Give it the `repo` scope.
  * Copy the token and paste it when the terminal asks for a password.

When the upload finishes you’ll see a line like:
```
To https://github.com/your‑username/house-construction-expense-tracker.git
   abc123..def456  main -> main
```
That means the repository on GitHub now contains your project! 🎉

---

## 10️⃣ Verify on GitHub
Open your browser and go back to the repository page (the same URL you used in step 1). You should now see all the folders and files listed.

---

## Quick Recap – One‑Line Cheat Sheet
```powershell
cd C:\Users\User\.gemini\antigravity\scratch\house-construction-expense-tracker

git init && git add . && git commit -m "initial commit" && git branch -M main &&
    git remote add origin https://github.com/<your‑username>/house-construction-expense-tracker.git &&
    git push -u origin main
```
Run each line **one after the other** (or copy‑paste the whole block; it works the same). If any line fails, the terminal will show an error – just let me know the exact message and I’ll help you fix it.

---

## Visual Aid (screenshots you uploaded)
Below is the screenshot you attached that shows the GitHub *new repo* page. It may help you locate the “Create repository” button.

![GitHub new‑repo screen](file:///C:/Users/User/.gemini/antigravity/brain/e05360ea-e0f6-47dd-bca4-c8f6179d43bb/.user_uploaded/media_1795102930681_c605e881.png)

---

### What to do next?
Once the repo is on GitHub you can move on to **step 3** (Supabase) and then **step 4** (Vercel deployment) from the earlier guide. Feel free to ask for the next set of tiny steps whenever you’re ready!
