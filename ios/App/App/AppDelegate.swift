import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.

#if DEBUG // Check if the app is running in debug mode
        if #available(macOS 13.3, iOS 16.4, tvOS 16.4, *) { // Check if the current platform version is at least macOS 13.3, iOS 16.4, or tvOS 16.4
            DispatchQueue.global(qos: .background).async { // Execute the following code asynchronously on a background thread with an appropriate quality of service
                let semaphore = DispatchSemaphore(value: 0) // Create a new DispatchSemaphore with an initial value of 0
                let delay: TimeInterval = 3.0 // Define a delay of 3 seconds
                _ = semaphore.wait(timeout: .now() + delay) // Wait for the semaphore to be signaled after the specified delay
                DispatchQueue.main.async { // Execute the following code asynchronously on the main thread
                    if let vc = self.window?.rootViewController as? CAPBridgeViewController { // Get a reference to the root view controller of the app's window and cast it to a CAPBridgeViewController
                        vc.bridge?.webView?.isInspectable = true // Set the isInspectable property of the CAPBridgeViewController's web view to true, allowing it to be inspected with the Safari Developer Tools
                    }
                }
            }
        }
#endif // End of debug mode check
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
