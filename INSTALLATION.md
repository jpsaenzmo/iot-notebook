# Iot-notebook and Kernelino installation

- Install Python and pip.

- Install jupyter lab:

	    pip install jupyterlab==2.2.9

- Install Node.js

- Install the iot-notebook extension:
	- In the iot-notebook repository folder:
    
            jlpm
        
            jlpm build		
	
            jupyter labextension install .
	
            jlpm build
	
            jupyter lab build

- Install kernelino:
	- Outside the kernelino repository folder:
            
            pip install ./jupyter-lab-kernelino 
	    
            python -m arduino_kernel.install

- Download the arduino cli and add it to the PATH variable