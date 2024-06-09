import React, { useState, useEffect, useRef, useCallback } from "react";
import { months, predefinedRanges } from "./constants";
import { CloseIcon, CalandarIcon, NextSvg, PrevSvg } from "./icon";
import { formateDate, scrollYearToView } from "./utils";


type DateRange = {
    startDate: Date | null;
    endDate: Date | null;
};

type Props = {
    onChange: (selectedRange: DateRange, weekends: Date[]) => void;
    startDate: Date | null;
    endDate: Date | null;
    clearSelectedRange: () => void;
};

const WeekdayDateRangePicker: React.FC<Props> = ({
    onChange,
    startDate,
    endDate,
    clearSelectedRange
}) => {
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        startDate: startDate,
        endDate: endDate,
    });


    const [isOpen, setIsOpen] = useState(false);
    const [calendar1Year, setCalendar1Year] = useState((startDate ?? new Date()).getFullYear());
    const [calendar1Month, setCalendar1Month] = useState((startDate ?? new Date()).getMonth());
    const [calendar2Year, setCalendar2Year] = useState((endDate ?? new Date()).getFullYear());
    const [calendar2Month, setCalendar2Month] = useState(
        endDate ? endDate.getMonth() : (new Date().getMonth() + 1)
    );
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState<{
        [key: number]: boolean;
    }>({ 1: false, 2: false });

    useEffect(() => {

        setSelectedRange({
            startDate: startDate,
            endDate: endDate,
        });

        setCalendar1Year((startDate ?? new Date()).getFullYear());
        setCalendar1Month((startDate ?? new Date()).getMonth());
        setCalendar2Year((endDate ?? new Date()).getFullYear());
        setCalendar2Month(
            endDate ? endDate.getMonth() : (new Date().getMonth() + 1)
        );

        const handleClickOutside = (event: MouseEvent) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsMonthYearPickerOpen({ 1: false, 2: false });
                setSelectedRange({
                    startDate: startDate,
                    endDate: endDate,
                });
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [startDate, endDate]);

    const clearInput = () => {
        setIsOpen(false);
        setIsMonthYearPickerOpen({ 1: false, 2: false });
        setSelectedRange({
            startDate: null,
            endDate: null,
        });
        clearSelectedRange();
    }

    const generateMonthDays = (year: number, month: number) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        const startDay = firstDayOfMonth.getDay();
        for (let i = 0; i < startDay; i++) {
            days.push(null); // Empty slots for days before the start of the month
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDayClick = (day: Date | null) => {

        if (!day || day.getDay() === 0 || day.getDay() === 6) return; // Ignore weekends and nulls

        if (
            !selectedRange.startDate ||
            (selectedRange.startDate && selectedRange.endDate)
        ) {
            setSelectedRange({ startDate: day, endDate: null });
        } else {
            if (selectedRange.startDate && day < selectedRange.startDate) {
                setSelectedRange({ startDate: day, endDate: selectedRange.startDate });
            } else {
                setSelectedRange({ ...selectedRange, endDate: day });
            }
        }
    };

    const getWeekendsInRange = (start: Date, end: Date): Date[] => {
        const weekends: Date[] = [];
        const date = new Date(start);
        while (date <= end) {
            if (date.getDay() === 0 || date.getDay() === 6) {
                weekends.push(new Date(date));
            }
            date.setDate(date.getDate() + 1);
        }
        return weekends;
    };

    const handleMonthChange = (increment: number, calendar: number) => {
        if (calendar === 1) {
            const newMonth = calendar1Month + increment;
            const newYear = calendar1Year + Math.floor(newMonth / 12);
            setCalendar1Year(newYear);
            setCalendar1Month(((newMonth % 12) + 12) % 12);
        } else if (calendar === 2) {
            const newMonth = calendar2Month + increment;
            const newYear = calendar2Year + Math.floor(newMonth / 12);
            setCalendar2Year(newYear);
            setCalendar2Month(((newMonth % 12) + 12) % 12);
        }
    };





    const renderDays = useCallback((year: number, month: number) => {
        const days = generateMonthDays(year, month);

        const date = new Date();
        const formatedDate: string = formateDate(date)


        return days.map((day, index) => {
            if (!day) {
                return <div key={index} className="day empty"></div>;
            }

            const isCurrentDate = formatedDate === formateDate(day)

            const isSelected =
                selectedRange.startDate &&
                selectedRange.endDate &&
                day >= selectedRange.startDate &&
                day <= selectedRange.endDate &&
                day.getDay() !== 0 &&
                day.getDay() !== 6;

            const isStartDate =
                selectedRange.startDate &&
                day.toDateString() === selectedRange.startDate.toDateString();
            const isEndDate =
                selectedRange.endDate &&
                day.toDateString() === selectedRange.endDate.toDateString();

            return (
                <button
                    key={index}
                    className={`day ${day.getDay() === 0 || day.getDay() === 6 ? "weekend" : ""
                        } ${isSelected ? "selected" : ""} ${isStartDate ? "start" : ""} ${isEndDate ? "end" : ""
                        } ${isCurrentDate ? "currentDay" : ""}`}
                    onClick={() => handleDayClick(day)}
                    disabled={day.getDay() === 0 || day.getDay() === 6}
                >
                    {day.getDate()}
                </button>
            );
        });
    }, [selectedRange]);

    const handleMonthYearSelect = (
        year: number,
        month: number,
        calendar: number
    ) => {
        if (calendar === 1) {
            setCalendar1Year(year);
            setCalendar1Month(month);
        } else if (calendar === 2) {
            setCalendar2Year(year);
            setCalendar2Month(month);
        }
        setIsMonthYearPickerOpen({ ...isMonthYearPickerOpen, [calendar]: false });
    };

    const renderMonthPicker = useCallback((calendar: number, selectedMonth: number, selectedYear: number) => {
        const years = [];


        for (let year = 1900; year <= 2100; year++) {
            years.push(
                <div key={year} id={`year_${calendar}_${year}`} className="year-month-wrapper">
                    <div className={selectedYear === year ? 'year selected' : ""}>{year}</div>
                    <div className="months">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={`month ${(selectedYear === year && (selectedMonth + 1) === i) ?
                                    'selected' :
                                    ""}`}
                                onClick={() => handleMonthYearSelect(year, i, calendar)}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return years;
    }, []);



    const handleSubmit = () => {
        if (selectedRange.startDate && selectedRange.endDate) {
            const weekends = getWeekendsInRange(
                selectedRange.startDate,
                selectedRange.endDate
            );
            onChange(selectedRange, weekends);
        }
        setIsOpen(false);
    }

    return (
        <div className="weekday-date-range-picker" ref={datePickerRef}>
            <div className="input-wrapper">
                <input
                    type="text"
                    readOnly
                    placeholder="yyyy-MM-dd ~ yyyy-MM-dd"
                    value={
                        selectedRange.startDate && selectedRange.endDate
                            ? `${formateDate(selectedRange.startDate)} ~ ${formateDate(selectedRange.endDate)}`
                            : ""
                    }
                    onClick={() => setIsOpen(!isOpen)}
                />

                {selectedRange.startDate && selectedRange.endDate ?
                    <span onClick={clearInput}>{CloseIcon}</span> :
                    <span onClick={() => setIsOpen(true)}>{CalandarIcon}</span>
                }
            </div>
            {isOpen && (
                <div className="popup">
                    <div className="calendars">
                        <div className="calendar">
                            <div className="header">
                                {!isMonthYearPickerOpen[1] && (
                                    <button
                                        className="left-button"
                                        onClick={() => handleMonthChange(-1, 1)}
                                    >
                                        {PrevSvg}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsMonthYearPickerOpen({
                                            ...isMonthYearPickerOpen,
                                            1: !isMonthYearPickerOpen[1],
                                        });
                                        scrollYearToView(1, calendar1Year)
                                    }}
                                >
                                    {months[calendar1Month + 1]} {calendar1Year}
                                </button>
                                {!isMonthYearPickerOpen[1] && (
                                    <button
                                        className="right-button"
                                        onClick={() => handleMonthChange(1, 1)}
                                    >
                                        {NextSvg}
                                    </button>
                                )}
                            </div>

                            {isMonthYearPickerOpen[1] ? (
                                <div className="year-picker">{renderMonthPicker(1, calendar1Month, calendar1Year)}</div>
                            ) : (
                                <div className="days">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                                        <div key={i} className="day-label">
                                            {d}
                                        </div>
                                    ))}
                                    {renderDays(calendar1Year, calendar1Month)}
                                </div>
                            )}
                        </div>

                        <div className="calendar-divider"></div>

                        <div className="calendar">
                            <div className="header">
                                {!isMonthYearPickerOpen[2] && (
                                    <button
                                        className="left-button"
                                        onClick={() => handleMonthChange(-1, 2)}
                                    >
                                        {PrevSvg}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsMonthYearPickerOpen({
                                            ...isMonthYearPickerOpen,
                                            2: !isMonthYearPickerOpen[2],
                                        });
                                        scrollYearToView(2, calendar2Year)
                                    }}
                                >
                                    {months[calendar2Month + 1]} {calendar2Year}
                                </button>
                                {!isMonthYearPickerOpen[2] && (
                                    <button
                                        className="right-button"
                                        onClick={() => handleMonthChange(1, 2)}
                                    >
                                        {NextSvg}
                                    </button>
                                )}
                            </div>

                            {isMonthYearPickerOpen[2] ? (
                                <div className="year-picker">
                                    {/* calendar2Year, calendar2Month */}
                                    {renderMonthPicker(2, calendar2Month, calendar2Year)}
                                </div>
                            ) : (
                                <div className="days">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                                        <div key={i} className="day-label">
                                            {d}
                                        </div>
                                    ))}
                                    {renderDays(
                                        calendar2Year + Math.floor(calendar2Month / 12),
                                        calendar2Month % 12
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {predefinedRanges && (
                        <div className="predefined-ranges">
                            <div className="default-select">
                                {predefinedRanges.map((range, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedRange(range.range);
                                            const weekends = getWeekendsInRange(
                                                range.range.startDate!,
                                                range.range.endDate!
                                            );
                                            onChange(range.range, weekends);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <button
                                    className="calendar-submit"
                                    disabled={!selectedRange.startDate || !selectedRange.endDate}
                                    onClick={handleSubmit}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeekdayDateRangePicker;
