package javaPongGame;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class score extends Rectangle{
	
	static int GAME_DIMENSION;
	int playerScore;
	
	score(int size)
	{
		score.GAME_DIMENSION = size;
	}
	
	public void draw(Graphics g)
	{
		g.setColor(Color.white);
		g.drawString(String.valueOf(playerScore), GAME_DIMENSION - 50, 50);
	}
}
