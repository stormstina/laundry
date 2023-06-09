
// ----------------------- DAY VIEW WHEN YOU CLICK A CAL. DATE -----------------------
const renderDayView = (bookings) => {
    dayGrid.querySelectorAll(".day:not(.deactivated)").forEach(li => {
        li.addEventListener("click", () => {

            const userHasBooking = getItem("user").hasBooking

            // If another cal-day has the active class - remove it
            dayGrid.querySelector(".active")?.classList.remove("active");
            addClass([li], "active")
            // Get the name of the month based on the clicked day's class
            const monthName = li.classList.contains("prevMonth") 
                ? months[month - 1]
                : li.classList.contains("nextMonth") ?
                months[month + 1]
                : months[month]
            
            const currentDate = new Date(year, months.indexOf(monthName), li.innerText)

            dayView.innerHTML = `
            <form id="bookTime" class="container">
                <div class="mb-5">
                    <h2 class="row gx-0 mb-4">
                        <span class="weekday col">${
                            weekdays[currentDate.getDay()]
                        }</span>
                        <span class="date col text-end">${
                            li.innerText
                        } ${monthName}</span>
                    </h2>
                    <div class="row gx-0 text-center">
                        <div class="col d-flex justify-content-center align-items-center">
                            <input type="radio" name="time-slot" id="morning" value="08" required/>
                            <label for="morning">08</label>
                        </div>
                        <div class="col d-flex justify-content-center align-items-center"/>
                            <input type="radio" name="time-slot" id="noon" value="12">
                            <label for="noon">12</label>
                        </div>
                        <div class="col d-flex justify-content-center align-items-center"/>
                            <input type="radio" name="time-slot" id="evening" value="17">
                            <label for="evening">17</label>
                        </div>
                        <div class="mt-4">
                            <p class="m-0"></p>
                        </div>
                        <div class="mt-4"><button type="submit" class="button primary-btn" ${
                            userHasBooking ? "disabled" : ""
                        }>Book</button></div>
                    </div>
                </div>
            </form>`;
            initateFormEventListener(document.querySelector("#bookTime"), bookings)
            updateSelectedDateTime(currentDate);


            //todo - break out as function
            let bookedTimes;
            // Checks if currentDate is already booked
            // Returns every date obj that matches the current looped date - otherwise []
            const match = bookings.filter(date => date.toLocaleDateString() === currentDate.toLocaleDateString())
            // If bookings exists in currentDate - get the time slots
            match.length > 0 ? bookedTimes = match.map(date => date.getHours()) : ""
            // If current date is already booked - disable radio for booked time slots
            bookedTimes ? diasableElem(bookedTimes) : ""
        })
    })
}

// ----------------------- UPDATE SELECTED DATES TIME SLOT -----------------------
const updateSelectedDateTime = (date) => {
    document
        .querySelectorAll("input[type='radio'][name='time-slot']")
        .forEach((slot) =>
            slot.addEventListener("change", async (e) => {
                /* Gets the latest data from local storage to always show the most up-to-date information,
                & finds wether the signed in user har a booking */
                const userHasBooking = getItem("user").hasBooking;

                /* Sets currentDate's time to the selected radio buttons time slot value */
                currentDate = date;
                currentDate.setHours(e.target.value, 00, 00);

                // Displays a message to the user based on whether they have a booking or not
                dayView.querySelector("p").innerHTML = !userHasBooking
                    ? `You've selected <b>${dateToText(
                          currentDate
                      )}</b>. To complete the process, please book this date.`
                    : "You already have a laundry booking. </br>Please cancel it on your account page before making a new one. ";
            })
        );
};


// ----------------------- EVENTLISTENER - FORM TO BOOK TIME SLOT -----------------------
const initateFormEventListener = (bookingForm, bookings) => {
    bookingForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const res = await addBooking(currentList, currentDate)
        
        if(res.ok) {
            /* If booking is added correctly - set local storage hasBooking variable to true, 
            which prevents the user from booking another time 
            Disable the currently viewed form-btn & radio-btn
            */
           //todo! commit msg för senate ändrignen 
            e.target.querySelector("input[type='radio']:checked").disabled = true;    
            e.target.querySelector("button[type='submit']").disabled = true
            e.target.querySelector("button[type='submit']").innerText = "Booked"
            dayView.querySelector("p").innerHTML = `Congratulations! Your booking is confirmed for <b>${dateToText(currentDate)}</b>.`
            //? Adds the recently booked date to global local bookings-arr - avoiding another API-request - which is looped when the day-view is rendered
            bookings.push(currentDate)
            // Updates Local storage hasBooking variable --> true
            const activeUser = getItem("user");
            activeUser.hasBooking = true;
            setItem("user", activeUser);
            // Adds purple dot on the booked cal. day
            addClass([document.querySelector("li.active")], "booked")
        }
    });
}
