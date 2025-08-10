import './index.css';

export function App() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <div>
        <h1 className="text-5xl font-bold my-4 leading-tight">Adventure Bros.</h1>
        <h2 className="text-3xl font-bold my-4 leading-tight">The Guild</h2>
        <p>
          Looking for help? Well you've come to the right place! The Adventure Bros. are dedicaed to
          supporting our community and improving the lives of those around us. Made up of
          adventurers with a wide varity of skills, our Guild uses the skills and time at our
          dispopsal to provide servies and support to those in need. If your task fits one of our
          services offered below, submit a mission request form and one of our available adventurers
          can accept the quest!
        </p>
      </div>
      <div>
        <h2 className="text-3xl font-bold my-4 leading-tight">Available Services</h2>
        <div className="flex justify-center items-center gap-8 mb-8">
          <ul>
            <li>Proxy Shopping</li>
            <li>Produce Gleaning</li>
          </ul>
          <div className="flex flex-col justify-start items-start">
            <h2>Mission Request Form:</h2>
            <form className="flex flex-col justify-start items-start">
              <label htmlFor="fname">First Name:</label>
              <input type="text" id="fname" name="firstname"/>
              <label htmlFor="lname">Last Name:</label>
              <input type="text" id="lname" name="lastname"/>
              <label htmlFor="phone">Phone #:</label>
              <input type="tel" id="phone" name="phoneNumber"/>
              <fieldset>
                <div className="flex flex-col justify-start items-start">
                  <legend>Mission Type:</legend>
                  <div className="flex flex-col">
                    <div className="flex ml-8 gap-2">
                      <input type="radio" id="option1" name="MissionType" value="Proxy_Shopping" />
                      <label htmlFor="option1">Proxy Shopping</label>
                    </div>
                    <div className="flex ml-8 gap-2">
                      <input
                        type="radio"
                        id="option2"
                        name="MissionType"
                        value="Produce_Gleaning"
                      />
                      <label htmlFor="option2">Produce Gleaning</label>
                    </div>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <div className="flex flex-col justify-start items-start">
                  <legend>Timeframe:</legend>
                  <div className="flex ml-8 gap-2">
                    <label htmlFor="start">Start Date:</label>
                    <input type="datetime-local" id="start" name="timeframe" />
                  </div>
                  <div className="flex ml-8 gap-2">
                    <label htmlFor="end">End Date:</label>
                    <input type="datetime-local" id="end" name="timeframe" />
                  </div>
                </div>
              </fieldset>
              <label htmlFor="desc">Description:</label>
              <input type="text" id="desc" name="description"/>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;