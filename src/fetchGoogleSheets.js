import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFilePath = path.join("../visualisations-450704-13191057dd89.json"); // Path to your JSON key
const spreadsheetId = "1G6nJiWchREYYBora7j2i09elLEJMq4Cr2DCIjs8aMfU"; // Replace with your Google Sheet ID

export async function fetchGoogleSheetData() {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
  
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Form Responses 1",
      });
  
      // Transform the data to match the expected format
      const [headers, ...rows] = response.data.values;
      return rows.map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        return rowData;
      });
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error);
      throw error;
    }
  }



