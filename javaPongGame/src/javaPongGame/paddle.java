package javaPongGame;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class paddle extends Rectangle{

	int xSpeed;
	int speed = 10;
	paddle(int xPos, int yPos, int width, int height)
	{
		super(xPos,yPos,width,height);
	}
	
	public void keyPressed(KeyEvent e)
	{
		if(e.getKeyCode()==KeyEvent.VK_A)
		{
			setXDir(-speed);
			move();
		}
		if(e.getKeyCode()==KeyEvent.VK_D)
		{
			setXDir(speed);
			move();
		}
	}
	
	public void keyReleased(KeyEvent e)
	{
		if(e.getKeyCode()==KeyEvent.VK_A)
		{
			setXDir(0);
			move();
		}
		if(e.getKeyCode()==KeyEvent.VK_D)
		{
			setXDir(0);
			move();
		}
	}
	
	public void setXDir(int x)
	{
		xSpeed = x;
	}
	
	public void move()
	{
		x = x + xSpeed;
	}
	
	public void draw(Graphics g)
	{
		g.setColor(Color.green);
		g.fillRect(x, y, width, height);
	}
}
