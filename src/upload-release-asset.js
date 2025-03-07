const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const gh = github.getOctokit(
      core.getInput("github-token", { required: true }),
    );
    const { owner, repo } = github.context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPath = core.getInput("asset_path", { required: true });
    const assetName = core.getInput("asset_name", { required: true });
    const assetContentType = core.getInput("asset_content_type", {
      required: true,
    });
    const release_id = core.getInput("release_id", { required: true });

    // Determine content-length for header to upload asset
    const contentLength = (filePath) => fs.statSync(filePath).size;

    // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
    const headers = {
      "content-type": assetContentType,
      "content-length": contentLength(assetPath),
    };

    // Upload a release asset
    // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
    const uploadAssetResponse = await gh.rest.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id,
      headers,
      name: assetName,
      data: fs.readFileSync(assetPath),
    });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl },
    } = uploadAssetResponse;

    // Set the output variable for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput("browser_download_url", browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
