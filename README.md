# Scan3DLive Web Application (UI)
<img width="953" height="440" alt="image" src="https://github.com/user-attachments/assets/2877e291-7bdd-4290-8970-d84f17be1b2a" />

<!-- GETTING STARTED -->
## Getting Started

The following documentation gives instructions on how to setup the user interface for the scan3dlive web application. 

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/EP-Capstone-3D-Scanner/scan3dlive-ui.git
   ```
2. Install NPM packages (see [here](https://nodejs.org/en/download) to install Node.js)
   ```sh
   npm install
   ```
4. Edit the scanner (NVIDIA JETSON's) IP address on your network in the context.jsx file:
   ```js
   const SCANNER_IP = 'ENTER SCANNER IP';
   ```
5. Navigate to http://[Scanner_IP]:5000 and allow the scanner access to your computer
6. Start the vite development server and navigate to the links shown in the terminal
   ```sh
   npm run dev
   ```
7. Connect to the scanner from the UI under the network tab. 


<!-- CONTACT -->
## Contact

Scan3DLiveEpcap - epcap@epcap.com

Project Link: [https://github.com/EP-Capstone-3D-Scanner/scan3dlive-ui.git](https://github.com/EP-Capstone-3D-Scanner/scan3dlive-ui.git)
