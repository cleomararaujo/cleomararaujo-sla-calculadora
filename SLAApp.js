
import { useState } from "react";
import { addMinutes, isWeekend, setHours, setMinutes, addDays, format } from "date-fns";

const SLA_HOURS = 6;
const WORK_START = { hour: 9, minute: 0 };
const LUNCH_START = { hour: 12, minute: 30 };
const LUNCH_END = { hour: 14, minute: 0 };
const WORK_END = { hour: 18, minute: 30 };

function isWithinWorkingHours(date) {
  const start = setMinutes(setHours(new Date(date), WORK_START.hour), WORK_START.minute);
  const lunchStart = setMinutes(setHours(new Date(date), LUNCH_START.hour), LUNCH_START.minute);
  const lunchEnd = setMinutes(setHours(new Date(date), LUNCH_END.hour), LUNCH_END.minute);
  const end = setMinutes(setHours(new Date(date), WORK_END.hour), WORK_END.minute);

  if (isWeekend(date)) return false;
  if (date < start) return false;
  if (date >= lunchStart && date < lunchEnd) return false;
  if (date > end) return false;
  return true;
}

function getNextWorkingTime(date) {
  let current = new Date(date);
  while (!isWithinWorkingHours(current)) {
    current = addMinutes(current, 1);
  }
  return current;
}

function calculateSLA(start) {
  let remainingMinutes = SLA_HOURS * 60;
  let current = getNextWorkingTime(start);

  while (remainingMinutes > 0) {
    const hour = current.getHours();
    const minute = current.getMinutes();

    const inLunchBreak = (hour === 12 && minute >= 30) || (hour === 13) || (hour === 14 && minute < 0);
    const afterWork = hour > 18 || (hour === 18 && minute > 30);

    if (isWeekend(current) || inLunchBreak || afterWork) {
      current = getNextWorkingTime(addMinutes(current, 1));
      continue;
    }

    current = addMinutes(current, 1);
    remainingMinutes--;
  }

  return current;
}

export default function SLAApp() {
  const [slaTime, setSlaTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const handleNow = () => {
    const now = new Date();
    setStartTime(now);
    setSlaTime(calculateSLA(now));
  };

  const handleManualChange = (e) => {
    const dt = new Date(e.target.value);
    setStartTime(dt);
    setSlaTime(calculateSLA(dt));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calculadora de SLA</h1>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Data/hora de início:</label>
        <div className="flex items-center gap-2">
          <button onClick={handleNow} className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow">
            Agora
          </button>
          <input
            type="datetime-local"
            onChange={handleManualChange}
            className="border p-2 rounded-xl shadow"
          />
        </div>
      </div>

      {slaTime && (
        <div className="mt-6 p-4 bg-green-100 rounded-xl shadow">
          <p className="text-lg font-semibold">
            🕒 SLA estoura em: {format(slaTime, "dd/MM/yyyy HH:mm")}
          </p>
        </div>
      )}
    </div>
  );
}
