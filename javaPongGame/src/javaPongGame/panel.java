package javaPongGame;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class panel extends JPanel implements Runnable{

	static final int WINDOW_DIMENSION = 500;
	static final Dimension WINDOW_SIZE = new Dimension(WINDOW_DIMENSION, WINDOW_DIMENSION);
	static final int BALL_SIZE = 25;
	static final int PADDLE_WIDTH = 100;
	static final int PADDLE_HEIGHT = 20;
	Thread gameThread;
	Image image;
	Graphics graphics;
	Random random;
	paddle playerPaddle;
	ball ball1;
	ball ball2;
	score gameScore;
	
	panel()
	{
		newPaddle();
		addBall();
		gameScore = new score(WINDOW_DIMENSION);
		this.setFocusable(true);
		this.addKeyListener(new AL());
		this.setPreferredSize(WINDOW_SIZE);
		
		gameThread = new Thread(this);
		gameThread.start();
	}
	 
	public void addBall()
	{
		random = new Random();
		ball1 = new ball((WINDOW_DIMENSION/2)-(BALL_SIZE/2), (WINDOW_DIMENSION/2)-(BALL_SIZE/2), BALL_SIZE);
	}
	
	public void newPaddle()
	{
		playerPaddle = new paddle((WINDOW_DIMENSION / 2)-(PADDLE_WIDTH/2),WINDOW_DIMENSION - 15, PADDLE_WIDTH, PADDLE_HEIGHT);
	}
	
	public void paint(Graphics g)
	{
		image = createImage(getWidth(), getHeight());
		graphics = image.getGraphics();
		draw(graphics);
		g.drawImage(image, 0, 0, this);
	}
	
	public void draw(Graphics g)
	{
		playerPaddle.draw(g);
		ball1.draw(g);
		gameScore.draw(g);
	}
	
	public void move()
	{
		playerPaddle.move();
		ball1.move();
	}
	
	public void collision()
	{
		if(playerPaddle.x<=0)
		{
			playerPaddle.x = 0;
		}
		if(playerPaddle.x >= WINDOW_DIMENSION-PADDLE_WIDTH)
		{
			playerPaddle.x = WINDOW_DIMENSION-PADDLE_WIDTH;
		}
		
		if(ball1.y<=0)
		{
			ball1.setYDir(-ball1.ySpeed);
		}
		if(ball1.x<=0)
		{
			ball1.setXDir(-ball1.xSpeed);
		}
		if(ball1.x>=WINDOW_DIMENSION-BALL_SIZE)
		{
			ball1.setXDir(-ball1.xSpeed);
		}
		
		if(ball1.intersects(playerPaddle))
		{
			ball1.ySpeed++;
			ball1.xSpeed += (random.nextInt(10)-5);
			ball1.setYDir(-ball1.ySpeed);
			gameScore.playerScore++;
		}
		
		if(ball1.y >= WINDOW_DIMENSION)  //lose case
		{
			newPaddle();
			addBall();
			System.out.println("YOU SCORED " + gameScore.playerScore);
			gameScore.playerScore = 0;
		}
	}
	
	public void run()
	{
		long lastTime = System.nanoTime();
		double amountOfTicks = 60.0;
		double ns = 1000000000 / amountOfTicks;
		double delta = 0;
		while(true)
		{
			long now = System.nanoTime();
			delta += (now - lastTime)/ns;
			lastTime = now;
			if(delta>=1)
			{
				move();
				collision();
				repaint();
				delta--;
			}
		}
	}
	
	public class AL extends KeyAdapter
	{
		public void keyPressed(KeyEvent e)
		{
			playerPaddle.keyPressed(e);
		}
		public void keyReleased(KeyEvent e)
		{
			playerPaddle.keyReleased(e);
		}
	}
}
