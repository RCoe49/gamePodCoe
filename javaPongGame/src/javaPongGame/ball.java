package javaPongGame;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class ball extends Rectangle{

	Random random;
	int xSpeed;
	int ySpeed;
	
	ball(int xPos,int yPos,int diam)
	{
		super(xPos, yPos, diam, diam);
		random = new Random();
		int randomXDir = random.nextInt(10);
		int randomYDir = random.nextInt(10);
		if(randomXDir == 5)
		{
			randomXDir--;
		}		
		if(randomYDir == 5)
		{
			randomYDir--;
		}
		setXDir(randomXDir-5);
		setYDir(randomYDir-5);
	}
	
	public void setXDir(int x)
	{
		xSpeed = x;
	}
	
	public void setYDir(int y)
	{
		 ySpeed = y;
	}
	
	public void move()
	{
		x += xSpeed;
		y += ySpeed;
	}
	
	public void draw(Graphics g)
	{
		g.setColor(Color.blue);
		g.fillOval(x,y,height,width);
	}
}
