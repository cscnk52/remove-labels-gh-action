import * as core from "@actions/core";
import * as github from "@actions/github";

const multilineStringToArray = (value) => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .sort();
};

const getLabelsToRemove = () => {
  return multilineStringToArray(core.getInput("labels"));
};

async function run() {
  const payload = github.context.payload;
  const token = core.getInput("token");
  const client = github.getOctokit(token);

  const labelsToRemove = getLabelsToRemove();

  const isIssue = Object.hasOwn(payload, "issue");
  const [target, issueOrPullReadable] = isIssue
    ? [payload.issue, "issue"]
    : [payload.pull_request, "pull request"];

  const issueOrPullNumber = target.number;

  const { data: labelsData } = await client.rest.issues.listLabelsOnIssue({
    ...github.context.repo,
    issue_number: issueOrPullNumber,
  });

  const filteredLabelsToRemove = labelsData
    .map((l) => l.name)
    .filter((labelName) => labelsToRemove.includes(labelName))
    .sort();

  for (const labelName of filteredLabelsToRemove) {
    core.info(
      `Found label "${labelName}" in ${issueOrPullReadable} #${issueOrPullNumber}.`
    );

    try {
      const { status } = await client.rest.issues.removeLabel({
        ...github.context.repo,
        issue_number: issueOrPullNumber,
        name: labelName,
      });

      if (status === 200) {
        core.info(
          `Label "${labelName}" successfully removed from ${issueOrPullReadable} #${issueOrPullNumber}.`
        );
      } else {
        core.warning(
          `Unexpected status "${status}" when removing label "${labelName}".`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      core.setFailed(
        `Error removing label "${labelName}" from ${issueOrPullReadable} #${issueOrPullNumber}: ${message}`
      );
    }
  }
}

if (import.meta.main) {
  run();
}

export { getLabelsToRemove, run };
