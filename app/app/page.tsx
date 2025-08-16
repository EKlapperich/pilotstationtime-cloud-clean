"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Roster = {
  id: number;
  gc: string;
  location: string;
  other: string;
};

export default function HomePage() {
  const [rows, setRows] = useState<Roster[]>([]);

  useEffect(() => {
    fetchRoster();

    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rosterlive" },
        (payload) => {
          console.log("Change received!", payload);
          fetchRoster();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchRoster() {
    const { data } = await supabase.from("rosterlive").select("*").order("id");
    if (data) setRows(data);
  }

  async function updateRow(id: number, column: string, value: string) {
    await supabase.from("rosterlive").update({ [column]: value }).eq("id", id);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pilot Station Time (Cloud Live-Sync)</h1>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>GC</th>
            <th>Location</th>
            <th>Other</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  value={row.gc || ""}
                  maxLength={3}
                  onChange={(e) => updateRow(row.id, "gc", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={row.location || ""}
                  onChange={(e) => updateRow(row.id, "location", e.target.value)}
                  list="locations"
                />
              </td>
              <td>
                <input
                  value={row.other || ""}
                  onChange={(e) => updateRow(row.id, "other", e.target.value)}
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
