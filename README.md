# Label & Link Manager — Google Workspace Add-on

A Google Workspace Add-on that lets you manage labeled quick links and Gmail labels from the side panel in Gmail, Google Chat, and Google Meet.

## Features

| Feature | Gmail | Chat | Meet |
|---|---|---|---|
| Save quick links with labels | Yes | Yes | Yes |
| Open saved links in one click | Yes | Yes | Yes |
| Apply Gmail labels to threads | Yes | - | - |
| Create new Gmail labels | Yes | - | - |
| Create custom label categories | Yes | Yes | Yes |
| Filter links by label | Yes | Yes | Yes |

## Project Structure

```
appsscript.json   — manifest (scopes, add-on config)
Code.gs           — entry points, universal homepage, label management card
Data.gs           — storage helpers (links, custom labels, Gmail labels)
CardUtils.gs      — shared card-building utilities
GmailCard.gs      — Gmail contextual + homepage cards
ChatCard.gs       — Google Chat homepage card
MeetCard.gs       — Google Meet homepage card
Handlers.gs       — all button/form action handlers
```

## Deployment Steps

### 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) and click **New project**
2. Rename the project to `Label & Link Manager`

### 2. Add the files

Delete the default `Code.gs` content, then create files matching each `.gs` file here:

For each file in this repo:
- Click **+** next to Files in the left panel
- Select **Script**
- Name it exactly (without the `.gs` extension — Apps Script adds it)
- Paste the file contents

Also update `appsscript.json`:
- Click **Project Settings** (gear icon)
- Enable **Show "appsscript.json" manifest file in editor**
- Paste the contents of `appsscript.json`

### 3. Deploy as a Workspace Add-on

1. Click **Deploy** > **New deployment**
2. Click the gear icon next to **Select type** and choose **Add-on**
3. Set:
   - Description: `Label & Link Manager`
   - Execute as: **Me**
   - Who has access: **Anyone in your organization** (or Myself for testing)
4. Click **Deploy**
5. Copy the **Deployment ID**

### 4. Install for testing

1. In Apps Script editor, click **Deploy** > **Test deployments**
2. Click **Install** under your deployment
3. Open Gmail, Chat, or Meet — the add-on icon appears in the right sidebar

### 5. Publish to Workspace Marketplace (optional)

1. Go to **Deploy** > **Manage deployments**
2. Follow the Google Workspace Marketplace SDK setup to publish for your organization

## Required OAuth Scopes

| Scope | Purpose |
|---|---|
| `gmail.labels` | Read Gmail label list |
| `gmail.modify` | Apply/remove labels on threads |
| `gmail.readonly` | Read thread label state |
| `script.storage` | Store quick links and custom labels |
| `userinfo.email` | Identify the user |
| `script.locale` | Locale for formatting |

## Local Development with clasp

```bash
npm install -g @google/clasp
clasp login
clasp clone <script-id>   # from script.google.com URL
# edit files locally, then:
clasp push
```

Get the script ID from **Project Settings** in the Apps Script editor.
