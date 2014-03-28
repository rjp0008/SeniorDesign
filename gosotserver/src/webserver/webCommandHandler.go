package webserver

import (
	"CustomProtocol"
	"fmt"
	"net/http"
)

func newDeviceHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		// Handle error
		fmt.Println("ParseForm error: ", err)
	}

	fmt.Println("Form: ", r.PostForm)
	buf := []byte{}
	// Device type
	buf = append(buf, []byte(r.PostForm.Get("deviceType"))...)
	buf = append(buf, 0x1B)
	// Device Id (phone number for Geogram, MAC Address for laptops)
	buf = append(buf, []byte(r.PostForm.Get("deviceId"))...)
	buf = append(buf, 0x1B)
	// Device name
	buf = append(buf, []byte(r.PostForm.Get("deviceName"))...)
	buf = append(buf, 0x1B)
	// Device owner, get user account info from session
	_, cookieErr := r.Cookie("userSession")
	if cookieErr != nil {
		fmt.Println("Cookie Error: ", cookieErr)
	} else {
		sesh, _ := store.Get(r, "userSession")
		buf = append(buf, []byte(sesh.Values["userId"].(string))...)
		buf = append(buf, 0x1B)
		//fmt.Println("Cookie userid: ", sesh.Values["userId"])
		//fmt.Println("Cookie isLoggedIn: ", sesh.Values["isLoggedIn"])
	}
	fmt.Println("buf: ", string(buf))
	// Create a response channel to receive response for the reqeust
	resCh := make(chan []byte)
	// Create request to register new device and send off request
	req := &CustomProtocol.Request{Id: CustomProtocol.AssignRequestId(), Destination: CustomProtocol.Database, Source: CustomProtocol.Web,
		OpCode: CustomProtocol.NewDevice, Payload: buf, Response: resCh}
	toServer <- req
	res := <-resCh
	// response is true if successfully registered, false if there is an error
	fmt.Println("Response: ", res[0])
	//TODO: notify client of the response
	if res[0] == 0 {
		fmt.Println("New Device Registration: Failed")
		fmt.Fprintf(w, "failed")
	} else {
		fmt.Fprintf(w, "success")
		fmt.Println("New Device Registration: Success")
	}

}

// Toggles the device's stolen status
func toggleDeviceHandler(w http.ResponseWriter, r *http.Request) {
	//TODO: user input for geogram PIN
	buf := []byte{}
	resCh := make(chan []byte)
	// Check for device type
	deviceType := r.PostForm.Get("deviceType")
	//deviceId := r.PostForm.Get("deviceId")

	buf = append(buf, []byte(r.PostForm.Get("deviceId"))...)
	buf = append(buf, 0x1B)

	switch deviceType {
	case "gps":
		reqToDB := &CustomProtocol.Request{Id: CustomProtocol.AssignRequestId(), Destination: CustomProtocol.Database, Source: CustomProtocol.Web,
			OpCode: CustomProtocol.ActivateGPS, Payload: buf, Response: resCh}
		toServer <- reqToDB
		// Default PIN-NUMBER for Geogram One
		buf = append(buf, []byte("1234")...)
		buf = append(buf, 0x1B)
		// Default interval 60 seconds
		buf = append(buf, []byte("60")...)
		buf = append(buf, 0x1B)
		reqToDevice := &CustomProtocol.Request{Id: CustomProtocol.AssignRequestId(), Destination: CustomProtocol.DeviceGPS, Source: CustomProtocol.Web,
			OpCode: CustomProtocol.ActivateIntervalGps, Payload: buf, Response: nil}
		toServer <- reqToDevice

	case "laptop":
		req := &CustomProtocol.Request{Id: CustomProtocol.AssignRequestId(), Destination: CustomProtocol.Database, Source: CustomProtocol.Web,
			OpCode: CustomProtocol.FlagStolen, Payload: buf, Response: resCh}
		toServer <- req
	default:
	}
	fmt.Println("Response: ", <-resCh)
}

func deviceInfoHandler(w http.ResponseWriter, r *http.Request) {
	buf := []byte{}
	// Device owner, get user account info from session
	_, cookieErr := r.Cookie("userSession")
	if cookieErr != nil {
		fmt.Println("Cookie Error: ", cookieErr)
	} else {
		sesh, _ := store.Get(r, "userSession")
		buf = append(buf, []byte(sesh.Values["userId"].(string))...)
		buf = append(buf, 0x1B)
		//fmt.Println("Cookie userid: ", sesh.Values["userId"])
		//fmt.Println("Cookie isLoggedIn: ", sesh.Values["isLoggedIn"])
	}
	// Create a response channel to receive response for the reqeust
	resCh := make(chan []byte)
	// Create request to register new device and send off request
	req := &CustomProtocol.Request{Id: CustomProtocol.AssignRequestId(), Destination: CustomProtocol.Database, Source: CustomProtocol.Web,
		OpCode: CustomProtocol.GetDeviceList, Payload: buf, Response: resCh}
	toServer <- req
	res := <-resCh
	fmt.Println("Response: ", res[0])
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
