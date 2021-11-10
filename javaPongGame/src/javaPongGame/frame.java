package javaPongGame;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class frame extends JFrame {

	panel startPanel;
	
	frame()
	{
		startPanel = new panel();
		this.add(startPanel);
		this.setTitle("Pong without friends");
		this.setResizable(false);
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		this.setBackground(Color.black);
		this.pack();
		this.setLocationRelativeTo(null);
		this.setVisible(true);
	}
}
