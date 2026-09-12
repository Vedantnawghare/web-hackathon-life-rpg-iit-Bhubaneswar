import { Quest } from "@/types/quest";

/**
 * Determines whether an active quest is overdue based on due_time and due_date.
 * E.g. If a quest had a morning due_time ("09:00") and current time is past 09:00,
 * and it has not been completed, it is marked as overdue.
 */
export function isQuestOverdue(quest?: Quest | null, now: Date = new Date()): boolean {
  if (!quest) return false;
  if (quest.is_completed_for_period || quest.status !== "ACTIVE") return false;

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // 1. Check due_date if provided
  if (quest.due_date) {
    const [dueYear, dueMonthStr, dueDayStr] = quest.due_date.split("-").map(Number);
    const dueMonth = dueMonthStr - 1; // 0-indexed month
    const dueDay = dueDayStr;

    // Compare date parts
    const dueDateObj = new Date(dueYear, dueMonth, dueDay, 23, 59, 59);
    const todayDateObj = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);

    if (dueDateObj < todayDateObj) {
      return true; // Past day
    }

    if (dueYear !== currentYear || dueMonth !== currentMonth || dueDay !== currentDate) {
      // Due date is in future
      return false;
    }
  }

  // 2. Check due_time (format "HH:MM", 24-hour)
  if (quest.due_time) {
    const parts = quest.due_time.split(":");
    if (parts.length === 2) {
      const dueH = parseInt(parts[0], 10);
      const dueM = parseInt(parts[1], 10);

      if (!isNaN(dueH) && !isNaN(dueM)) {
        if (currentHours > dueH) {
          return true;
        }
        if (currentHours === dueH && currentMinutes > dueM) {
          return true;
        }
      }
    }
  }

  return false;
}

export interface OverdueDetails {
  isOverdue: boolean;
  message: string;
  timeTag: string;
}

export function getQuestOverdueDetails(quest?: Quest | null, now: Date = new Date()): OverdueDetails {
  if (!quest || !isQuestOverdue(quest, now)) {
    return {
      isOverdue: false,
      message: "",
      timeTag: quest?.due_time ? `@ ${quest.due_time}` : "",
    };
  }

  let timeTag = quest.due_time ? `Deadline @ ${quest.due_time}` : "Deadline Passed";
  if (quest.due_time) {
    const [hStr] = quest.due_time.split(":");
    const h = parseInt(hStr, 10);
    if (h < 12) {
      timeTag = `Morning Deadline @ ${quest.due_time}`;
    } else if (h < 17) {
      timeTag = `Afternoon Deadline @ ${quest.due_time}`;
    } else {
      timeTag = `Evening Deadline @ ${quest.due_time}`;
    }
  }

  return {
    isOverdue: true,
    message: "Deadline missed! Adversary has seized the initiative and launched an ambush attack!",
    timeTag,
  };
}
