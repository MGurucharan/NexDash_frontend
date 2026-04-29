import { useState, useMemo } from "react";

function TableView({ data }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState("none");
  const [domainFilter, setDomainFilter] = useState("all");

  const columns = [
    "Team Number",
    "Team Name",
    "Team Leader",
    "Phone",
    "Email",
    "Project",
    "Domain",
    "Amount Paid",
    "Mode",
    "Transaction ID",
    "Date",
    "Screenshot"
  ];

  const getCellValue = (row, index) => {
    // 0: Number, 1: Size, 2: Name, 3: Leader, 4: Phone, 5: Email, 6: Project, 7: Domain
  const mapping = {
    "Team Number": 0,
    "Team Name": 2,
    "Team Leader": 3,
    "Phone": 4,
    "Email": 5,
    "Project": 6,
    "Domain": 7,
    "Amount Paid": 9,
    "Mode": 10,
    "Transaction ID": 11,
    "Date": 12,
    "Screenshot": 13
  };

    const dataIndex = typeof index === 'string' ? mapping[index] : index;

    if (Array.isArray(row)) {
      return row[dataIndex] ?? "";
    }
    return row?.[dataIndex] ?? "";
  };

  // Get unique domains for the filter
  const domains = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const uniqueDomains = new Set(data.map((row) => getCellValue(row, "Domain")).filter(Boolean));
    return ["all", ...Array.from(uniqueDomains).sort()];
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    let processed = [...data];

    // Domain Filter
    if (domainFilter !== "all") {
      processed = processed.filter(
        (row) => getCellValue(row, "Domain") === domainFilter
      );
    }

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter((row) => {
        const teamNumber = String(getCellValue(row, "Team Number")).toLowerCase();
        const teamName = String(getCellValue(row, "Team Name")).toLowerCase();
        const teamLeader = String(getCellValue(row, "Team Leader")).toLowerCase();
        const domain = String(getCellValue(row, "Domain")).toLowerCase();

        return (
          teamNumber.includes(query) ||
          teamName.includes(query) ||
          teamLeader.includes(query) ||
          domain.includes(query)
        );
      });
    }

    // Sort
    if (sortConfig !== "none") {
      processed.sort((a, b) => {
        let valA, valB;

        if (sortConfig.includes("Name")) {
          valA = String(getCellValue(a, "Team Name")).toLowerCase();
          valB = String(getCellValue(b, "Team Name")).toLowerCase();
          return sortConfig === "NameAZ"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (sortConfig.includes("Number")) {
          valA = parseFloat(getCellValue(a, "Team Number")) || 0;
          valB = parseFloat(getCellValue(b, "Team Number")) || 0;
          return sortConfig === "NumberAsc" ? valA - valB : valB - valA;
        }

        if (sortConfig.includes("Domain")) {
          valA = String(getCellValue(a, "Domain")).toLowerCase();
          valB = String(getCellValue(b, "Domain")).toLowerCase();
          return sortConfig === "DomainAZ"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return 0;
      });
    }

    return processed;
  }, [data, searchQuery, sortConfig, domainFilter]);

  if (!Array.isArray(data) || data.length === 0)
    return <p className="empty-state">No Data</p>;

  return (
    <div className="table-actions">
      <div className="table-toolbar">
        <div className="search-field">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="all">All Domains</option>
            {domains.filter(d => d !== "all").map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          <select
            className="sort-select"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="none">Sort By</option>
            <option value="NameAZ">Name (A-Z)</option>
            <option value="NameZA">Name (Z-A)</option>
            <option value="NumberAsc">Number (↑)</option>
            <option value="NumberDesc">Number (↓)</option>
            <option value="DomainAZ">Domain (A-Z)</option>
            <option value="DomainZA">Domain (Z-A)</option>
          </select>
        </div>

        <div className="results-badge">
          {filteredAndSortedData.length} Results
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => {
                    const isProject = column === "Project";
                    const isDomain = column === "Domain";
                    const cellValue = getCellValue(row, column);

                    return (
                        <td 
                          key={column} 
                          className={`${isProject ? "project-cell" : ""} ${isDomain ? "domain-cell" : ""}`}
                        >
                          {column === "Screenshot" && cellValue !== "-" ? (
                            <a href={cellValue} target="_blank" rel="noreferrer" className="view-link">
                              👁️ View
                            </a>
                          ) : isDomain ? (
                            <span className="domain-badge">{cellValue}</span>
                          ) : (
                            cellValue
                          )}
                        </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAndSortedData.length === 0 && (
          <p className="empty-state">No matching teams found</p>
        )}
      </div>
    </div>
  );
}

export default TableView;
