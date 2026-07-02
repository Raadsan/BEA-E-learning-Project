type ExportColumn<T> = {
    key: keyof T | string;
    label: string;
    getValue?: (row: T) => unknown;
};

const escapeHtml = (value: unknown) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const exportRowsToExcel = <T,>(rows: T[], columns: ExportColumn<T>[], filename: string) => {
    const headerRow = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
    const bodyRows = rows
        .map((row) => {
            const cells = columns
                .map((column) => {
                    const rawValue = column.getValue
                        ? column.getValue(row)
                        : (row as Record<string, unknown>)?.[String(column.key)];
                    return `<td>${escapeHtml(rawValue)}</td>`;
                })
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head>
                <meta charset="UTF-8" />
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                    th { background: #010080; color: white; }
                </style>
            </head>
            <body>
                <table>
                    <thead><tr>${headerRow}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </body>
        </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const exportRowsToCsv = <T,>(rows: T[], columns: ExportColumn<T>[], filename: string) => {
    const headers = columns.map((column) => escapeCsv(column.label)).join(",");
    const lines = rows.map((row) =>
        columns
            .map((column) => {
                const rawValue = column.getValue
                    ? column.getValue(row)
                    : (row as Record<string, unknown>)?.[String(column.key)];
                return escapeCsv(rawValue);
            })
            .join(",")
    );

    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const openPdfPrintWindow = <T,>(
    title: string,
    rows: T[],
    columns: ExportColumn<T>[],
    metaLines: string[] = []
) => {
    const popup = window.open("", "_blank", "width=1200,height=800");
    if (!popup) return;

    const headerRow = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
    const bodyRows = rows
        .map((row) => {
            const cells = columns
                .map((column) => {
                    const rawValue = column.getValue
                        ? column.getValue(row)
                        : (row as Record<string, unknown>)?.[String(column.key)];
                    return `<td>${escapeHtml(rawValue)}</td>`;
                })
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    popup.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>${escapeHtml(title)}</title>
                <meta charset="UTF-8" />
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                    h1 { margin: 0 0 8px; color: #010080; }
                    .meta { margin-bottom: 20px; color: #4b5563; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #010080; color: #fff; }
                    tr:nth-child(even) td { background: #f9fafb; }
                    @page { size: A4 landscape; margin: 12mm; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(title)}</h1>
                <div class="meta">${metaLines.map(escapeHtml).join("<br />")}</div>
                <table>
                    <thead><tr>${headerRow}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
                <script>
                    window.onload = function () {
                        setTimeout(function () { window.print(); }, 300);
                    };
                </script>
            </body>
        </html>
    `);
    popup.document.close();
};
