export function formateDate(date: Date): string {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const currentDate = String(date.getDate()).padStart(2,"0");
    const formatedDate = `${currentYear}-${currentMonth}-${currentDate}`

    return formatedDate
}

export function scrollYearToView(calendar: 1 | 2, year: number) {
    setTimeout(() => {
        const element = document.getElementById(`year_${calendar}_${year}`);
        element?.scrollIntoView()
    }, 200)
}