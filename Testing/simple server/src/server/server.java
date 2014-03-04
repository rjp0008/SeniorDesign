package server;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Arrays;
import java.util.Random;

/**
 * simple server that will accept 1 tcp connection and print some basic info.
 */
public class server {
	
	private static ServerSocket ss;
	private static Socket connection;
	private static BufferedReader fromClient;
	private static DataOutputStream toClient;
	private static char single[] = new char[1];
	
	/**
	 * remove next char, useful for leftover newlines
	 */
	private static void removeNewline()
	{
		try {
			fromClient.read(single);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * Opens a server socket on port 10011 and accepts the first connection
	 */
	private static void connect()
	{
		try {
			ss = new ServerSocket(10011);
			connection = ss.accept();
			fromClient = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			toClient = new DataOutputStream(connection.getOutputStream());
			System.out.println("Connected");
		} catch (Exception e)
		{}
	}
	
	/**
	 * Closes any connections and server sockets
	 */
	private static void disconnect()
	{
		try
		{
			toClient.close();
			fromClient.close();
			connection.close();
			ss.close();
			System.out.println("Disconnected");
		} catch (Exception e)
		{}
	}
	
	/**
	 * adds a separator line to make tests easily distinguishable in the console
	 */
	private static void separator()
	{
		System.out.println("\n===============================================");
	}
	
	/**
	 * tests that the service sends its MAC address immediately upon connection
	 */
	private static void testConnect()
	{
		separator();
		System.out.println("Testing connection and MAC address sending...");
		connect();
		try {
			System.out.println(fromClient.readLine());
			fromClient.readLine(); //remove left over newline
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		disconnect();
	}
	
	private static void testKeylogger()
	{
		separator();
		System.out.println("Testing turning keylogger on/off and receiving key log files...");
		connect();
		try 
		{
			fromClient.readLine(); // get rid of MAC address
			fromClient.readLine(); //remove left over newline
			System.out.print("Type here (off): ");
			Thread.sleep(10000);
			System.out.println("\nTurning keylogger on");
			System.out.print("Type here (on): ");
			toClient.writeByte(0);
			Thread.sleep(10000);
			System.out.println("\nTurning keylogger off");
			toClient.writeByte(1);
			System.out.print("Type here (off): ");
			Thread.sleep(10000);
			System.out.println("\nRequesting keylog...");
			toClient.writeByte(3);
			Thread.sleep(1000);
			while (fromClient.ready()) {
				char single[] = new char[1];
				fromClient.read(single);
				System.out.println("op code: " + (byte)single[0]);
				System.out.println("Keylog: " + fromClient.readLine());
				fromClient.readLine(); //remove left over newline
				Thread.sleep(100);
			}
		} catch (IOException | InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		disconnect();
	}
	
	private static void testIPTrace()
	{
		separator();
		System.out.println("IP trace route...");
		connect();
		try 
		{
			fromClient.readLine(); // get rid of MAC address
			fromClient.readLine(); //remove left over newline
			System.out.println("Requesting trace route...");
			toClient.writeByte(2);
			Thread.sleep(1000);
			while (fromClient.ready()) {
				char single[] = new char[1];
				fromClient.read(single);
				System.out.println("op code: " + (byte)single[0]);
				System.out.println("IP trace route: " + fromClient.readLine());
				fromClient.readLine(); //remove left over newline
				Thread.sleep(100);
			}
		} catch (Exception e)
		{
			e.printStackTrace();
		}
		disconnect();
	}
	
	private static void testReconnect()
	{
		separator();
		System.out.println("Testing reconnect times...");
		connect();
		try {
			System.out.println("\nNot flagged as stolen");
			disconnect();
			long dis = System.currentTimeMillis();
			connect();
			long con = System.currentTimeMillis();
			System.out.println("Reconnect time (ms): " + (con - dis));
			
			System.out.println("\nReporting stolen");
			toClient.writeByte(5);
			disconnect();
			dis = System.currentTimeMillis();
			connect();
			con = System.currentTimeMillis();
			System.out.println("Reconnect time (ms): " + (con - dis));
			System.out.println("\nReporting not stolen");
			toClient.writeByte(4);
			disconnect();
			dis = System.currentTimeMillis();
			connect();
			con = System.currentTimeMillis();
			System.out.println("Reconnect time (ms): " + (con - dis));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		disconnect();
	}
	
	public static void main(String args[]) throws Exception {
		testConnect();
		testKeylogger();
		testIPTrace();
		testReconnect();
	}
	
}