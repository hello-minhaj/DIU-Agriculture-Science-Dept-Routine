import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return res.status(500).json({
      error: 'Server configuration missing (ADMIN_PIN).',
    });
  }

  const { pin, verifyOnly, routineData, commitMessage } = req.body ?? {};

  if (String(pin || '').trim() !== adminPin.trim()) {
    return res.status(401).json({ error: 'Incorrect Admin PIN' });
  }

  if (verifyOnly === true) {
    return res.status(200).json({ ok: true });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubToken || !githubOwner || !githubRepo) {
    return res.status(500).json({
      error:
        'Server configuration missing (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).',
    });
  }

  if (!routineData || typeof routineData !== 'object') {
    return res.status(400).json({ error: 'Missing routineData payload.' });
  }

  const filePath = 'public/data/routine.json';
  const apiUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`;

  try {
    // 1. Fetch current file SHA if it exists
    let currentSha: string | undefined;
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      currentSha = existing.sha;
    } else if (getRes.status !== 404) {
      const errText = await getRes.text();
      return res.status(502).json({
        error: `Failed to read existing routine.json from GitHub (${getRes.status}): ${errText}`,
      });
    }

    // 2. Commit updated JSON via GitHub Contents API
    const contentBase64 = Buffer.from(
      JSON.stringify(routineData, null, 2) + '\n',
      'utf-8'
    ).toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message:
          typeof commitMessage === 'string' && commitMessage.trim()
            ? commitMessage.trim()
            : 'chore: update public/data/routine.json',
        content: contentBase64,
        ...(currentSha ? { sha: currentSha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return res.status(502).json({
        error: `GitHub commit failed (${putRes.status}): ${errText}`,
      });
    }

    const result = (await putRes.json()) as {
      commit?: { sha?: string; html_url?: string };
    };

    return res.status(200).json({
      ok: true,
      message: 'Committed public/data/routine.json to GitHub successfully.',
      commitSha: result.commit?.sha,
      commitUrl: result.commit?.html_url,
    });
  } catch (err) {
    return res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Unexpected error publishing routine.',
    });
  }
}
