import { SheetData, Task, TaskStatus } from '../types';

// ============================================================================
// ⚠️ GOOGLE SHEETS CONNECTION SETUP
// ============================================================================
// 1. Ensure your Google Sheet "Student" tab has these headers (Row 1):
//    A: name, B: cohort, C: passcode
//
// 2. Ensure "Submissions" tab has these headers (Row 1):
//    A: Timestamp, B: Student Name, C: Task Title, D: Submission Content
//
// 3. ⚠️ NEW: Create a "LoginLogs" tab with these headers (Row 1):
//    A: Timestamp, B: Student Name
//
// 4. Go to Extensions > Apps Script
// 5. Paste the UPDATED code found at the VERY BOTTOM of this file.
// 6. Click Deploy > Manage Deployments > Edit (pencil icon) > Version: New Version > Deploy.
// 7. Paste the resulting Web App URL below.
// ============================================================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAS2WRwJ2gg3KgSlc6TNDvk3_MbG0_wERDmi5CkOlKtTRlYFpowStE805uGJz4SISm/exec'; 

export const sheetService = {
  // Login now fetches the specific student data if credentials match
  login: async (name: string, passcode: string): Promise<SheetData | null> => {
    // Fallback Mock Logic
    if (!SCRIPT_URL || SCRIPT_URL.includes('INSERT_YOUR')) {
      console.log("ℹ️ No API URL configured. Using local mock data.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Mock validation: Passcode must be '1234'
      if (passcode === '1234') {
        return getMockData(name);
      }
      return null;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          name: name,
          passcode: passcode
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        return transformResponse(result.data);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Login Error:", error);
      // Fallback for demo purposes if fetch fails entirely
      if (passcode === '1234') return getMockData(name);
      return null;
    }
  },

  submitTask: async (taskId: string, content: string, studentName: string, taskTitle: string): Promise<TaskStatus> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('INSERT_YOUR')) {
      console.log("Mock Submit:", { taskId, content, studentName, taskTitle });
      await new Promise(resolve => setTimeout(resolve, 1000));
      return TaskStatus.SUBMITTED;
    }

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'submit',
          taskId,
          content,
          studentName,
          taskTitle
        })
      });
      
      const result = await res.json();
      return result.newStatus as TaskStatus;
    } catch (error) {
      console.error("Submission Error:", error);
      return TaskStatus.SUBMITTED;
    }
  }
};

// --- Helper: Transform raw sheet data to App types ---
const transformResponse = (data: any): SheetData => {
  return {
    student: {
      name: data.student?.name || "Unknown Student",
      cohort: data.student?.cohort || "Unknown Cohort"
    },
    currentTopic: data.settings?.currentTopic || "General",
    progress: {
      week: Number(data.settings?.currentWeek || 1),
      month: Number(data.settings?.currentMonth || 1),
      totalWeeks: Number(data.settings?.totalWeeks || 12),
      totalMonths: Number(data.settings?.totalMonths || 3),
      weeklyTasksCompleted: Array.isArray(data.tasks) ? data.tasks.filter((t: any) => 
        t.status === 'Submitted' || t.status === 'Resubmitted' || t.status === 'Checked'
      ).length : 0,
      totalWeeklyTasks: Array.isArray(data.tasks) ? data.tasks.length : 0
    },
    tasks: Array.isArray(data.tasks) ? data.tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      referenceLinks: t.referenceLinks ? String(t.referenceLinks).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      learningMaterials: t.learningMaterials ? String(t.learningMaterials).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      status: t.status as TaskStatus,
      weekId: Number(t.weekId)
    })) : []
  };
};

// --- Fallback Mock Data ---
const getMockData = async (studentName: string): Promise<SheetData> => {
  return {
    student: { name: studentName || "Alex V.", cohort: "Batch 24" },
    currentTopic: "Advanced React Patterns & Optimization",
    progress: {
      week: 3, month: 1, totalWeeks: 12, totalMonths: 3,
      weeklyTasksCompleted: 2, totalWeeklyTasks: 7
    },
    tasks: [
      {
        id: 't1', title: 'Project Setup & Environment', description: 'Initialize repository.',
        referenceLinks: ['https://react.dev'], learningMaterials: ['Intro to React'],
        status: TaskStatus.CHECKED, weekId: 3
      },
      {
        id: 't2', title: 'Component Architecture', description: 'Draft component hierarchy.',
        referenceLinks: [], learningMaterials: [],
        status: TaskStatus.LIVE, weekId: 3
      },
      {
        id: 't3', title: 'Context API Implementation', description: 'Fix the re-render issues.',
        referenceLinks: [], learningMaterials: [],
        status: TaskStatus.REDO, weekId: 3
      },
      {
        id: 't4', title: 'Performance Hooks', description: 'Use useMemo and useCallback effectively.',
        referenceLinks: [], learningMaterials: [],
        status: TaskStatus.LOCKED, weekId: 3
      }
    ]
  };
};


/* 
============================================================================
   APPS SCRIPT CODE (COPY & PASTE INTO GOOGLE SHEETS SCRIPT EDITOR)
============================================================================

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Use POST for login"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // === LOGIN ACTION ===
    if (data.action === "login") {
       const studentSheet = ss.getSheetByName("Student");
       const studentRows = studentSheet.getDataRange().getValues();
       
       let studentData = null;
       
       // Start from 1 to skip header. Check Name (0) and Passcode (2)
       for (let i = 1; i < studentRows.length; i++) {
         // Loose equality for numbers/strings match
         if (studentRows[i][0] == data.name && studentRows[i][2] == data.passcode) {
           studentData = {
             name: studentRows[i][0],
             cohort: studentRows[i][1]
           };
           break;
         }
       }
       
       if (studentData) {
         const timestamp = new Date().toISOString();

         // --- LOG THE LOGIN ---
         let logSheet = ss.getSheetByName("LoginLogs");
         if (!logSheet) {
           logSheet = ss.insertSheet("LoginLogs");
           logSheet.appendRow(["Timestamp", "Student Name"]);
         }
         logSheet.appendRow([timestamp, studentData.name]);
         // --------------------

         // Fetch other data only if login success
         const tasksSheet = ss.getSheetByName("Tasks");
         const settingsSheet = ss.getSheetByName("Settings");
         
         const getRows = (sheet) => {
            if (!sheet) return [];
            const r = sheet.getDataRange().getValues();
            const h = r[0];
            return r.slice(1).map(row => {
              let obj = {};
              h.forEach((header, k) => obj[header] = row[k]);
              return obj;
            });
         };
         
         const payload = {
           student: studentData,
           tasks: getRows(tasksSheet),
           settings: getRows(settingsSheet)[0] || {}
         };
         
         return ContentService.createTextOutput(JSON.stringify({ status: "success", data: payload }))
           .setMimeType(ContentService.MimeType.JSON);
       } else {
         return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid credentials" }))
           .setMimeType(ContentService.MimeType.JSON);
       }
    }
    
    // === SUBMIT ACTION ===
    if (data.action === "submit") {
      const sheet = ss.getSheetByName("Tasks");
      const rows = sheet.getDataRange().getValues();
      const result = { status: "success", newStatus: "Submitted" };
      const timestamp = new Date().toISOString();
      
      // 1. Update status in Tasks Sheet
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.taskId) {
          const currentStatus = rows[i][5]; 
          let newStatus = "Submitted";

          if (currentStatus === "Submitted" || currentStatus === "Resubmitted" || currentStatus === "Redo") {
            newStatus = "Resubmitted";
          }

          sheet.getRange(i + 1, 6).setValue(newStatus);
          sheet.getRange(i + 1, 8).setValue(data.content);
          sheet.getRange(i + 1, 9).setValue(timestamp);
          
          result.newStatus = newStatus;
          break;
        }
      }

      // 2. Log to Submissions Sheet
      let submissionsSheet = ss.getSheetByName("Submissions");
      if (!submissionsSheet) {
        // Auto-create if missing (failsafe)
        submissionsSheet = ss.insertSheet("Submissions");
        submissionsSheet.appendRow(["Timestamp", "Student Name", "Task Title", "Submission Content"]);
      }
      
      submissionsSheet.appendRow([
        timestamp,
        data.studentName || "Unknown",
        data.taskTitle || "Unknown Task",
        data.content
      ]);

      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
     return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/