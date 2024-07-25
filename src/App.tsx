import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGitHubIssues = async () => {
    const GITHUB_USERNAME = "gluestack";
    const GITHUB_REPO = "gluestack-ui";
    const GITHUB_TOKEN = "your-token"; // Replace with your actual token
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/issues`;

    setLoading(true);
    setError(null);

    try {
      let issues: any = [];
      let page = 1;
      while (true) {
        const response = await axios.get(GITHUB_API_URL, {
          // headers: {
          //   Authorization: `token ${GITHUB_TOKEN}`,
          // },
          params: {
            state: "open", // Fetch only open issues
            // state: "all",  //to fetch all issues
            page,
            per_page: 100,
          },
        });
        if (response.data.length === 0) {
          break;
        }
        // Filter out pull requests
        const filteredIssues = response.data.filter(
          (issue: any) => !issue.pull_request
        );
        issues = issues.concat(filteredIssues);
        page += 1;
      }

      const issueData = issues.map((issue: any) => ({
        Title: issue.title,
        Link: issue.html_url,
        Labels: issue.labels.map((label: any) => label.name).join(", "),
      }));
      // console.log("issueData", issueData);

      const worksheet = XLSX.utils.json_to_sheet(issueData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Open Issues");

      XLSX.writeFile(workbook, "open_github_issues.xlsx");
      setLoading(false);
      alert("Open issues have been written to open_github_issues.xlsx");
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Open Issues to Excel</h1>
        <button onClick={fetchGitHubIssues} disabled={loading}>
          {loading ? "Loading..." : "Fetch and Export Open Issues"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </header>
    </div>
  );
};

export default App;
