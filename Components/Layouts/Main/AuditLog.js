"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";

const REFRESH_INTERVAL = 10000; // 10 seconds

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const pollingRef = useRef(null);
  const inFlightRef = useRef(false);
  const abortRef = useRef(null);

  // -----------------------
  // Fetch audit logs
  // -----------------------
  const fetchAuditLogs = async () => {
    if (inFlightRef.current) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();
    inFlightRef.current = true;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/history/getHistory`,
        {
          headers: {
            // companyId: Cookies.get("companyId"),
            form: "All",
            user: "All",
            action: "All",
          },
          signal: abortRef.current.signal,
        }
      );

      console.log("Audit fetch response:", res.data);

      setLogs(res.data.result || []);
      setLastUpdated(new Date());
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Audit fetch failed:", err);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  // -----------------------
  // Polling lifecycle
  // -----------------------
  useEffect(() => {
    fetchAuditLogs();

    pollingRef.current = setInterval(fetchAuditLogs, REFRESH_INTERVAL);

    return () => {
      clearInterval(pollingRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div
      style={{
        width: "80vw",
        height: "75vh",
        margin: "0 auto",
        border: "1px solid #222",
        borderRadius: "8px",
        padding: "16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h4 style={{ margin: 0 }}>Audit Log</h4>
        <div style={{ textAlign: "right", fontSize: "13px" }}>
          <div style={{ color: "green", fontWeight: 600 }}>
            ● Live (10s refresh)
          </div>
          <div>
            Last updated:{" "}
            {lastUpdated
              ? moment(lastUpdated).format("HH:mm:ss")
              : "--"}
          </div>
        </div>
      </div>

      {/* SCROLLABLE TABLE */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          borderTop: "1px solid #ddd",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#f3f3f3" }}>
              <th style={th}>#</th>
              <th style={th}>Date | Time</th>
              <th style={th}>User</th>
              <th style={th}>Form</th>
              <th style={th}>Action</th>
              <th style={th}>Doc #</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" style={{ padding: 16, textAlign: "center" }}>
                  Loading audit logs...
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: 16, textAlign: "center" }}>
                  No audit records found.
                </td>
              </tr>
            )}

            {logs.map((log, index) => (
              <tr key={log.id || index}>
                <td style={td}>{index + 1}</td>
                <td style={td}>
                  {moment(log.createdAt).format(
                    "DD-MM-YYYY | HH:mm:ss"
                  )}
                </td>
                <td style={td}>{log.Employee?.name || ""}</td>
                <td style={td}>{log.formName}</td>
                <td style={td}>{log.type}</td>
                <td style={td}>{log.docNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const th = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  fontSize: "13px",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e5e5e5",
  fontSize: "13px",
};

export default AuditLog;
