"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("gcLogLive")
        .select("id,gcCode,location,other")
        .order("createdAt", { ascending: true })
        .limit(15);
      setRows(data || []);
    };
    load();

    const channel = supabase
      .channel("gcLogLive-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gcLogLive" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateRow(id, patch) {
    await supabase.from("gcLogLive").update(patch).eq("id", id);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pilot Station Time — GC Log (live sync)</h1>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>GC (3 letters)</th>
            <th>Location</th>
            <th>Other</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  value={row.gcCode || ""}
                  maxLength={3}
                  onChange={(e) =>
                    updateRow(row.id, { gcCode: e.target.value.toUpperCase() })
                  }
                />
              </td>
              <td>
                <input
                  value={row.location || ""}
                  onChange={(e) =>
                    updateRow(row.id, { location: e.target.value })
                  }
                  list="locations"
                />
              </td>
              <td>
                <input
                  value={row.other || ""}
                  onChange={(e) =>
                    updateRow(row.id, { other: e.target.value })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <datalist id="locations">
        <option value="Seattle" />
        <option value="Tacoma" />
        <option value="Everett" />
        <option value="Other" />
      </datalist>
    </div>
  );
}
