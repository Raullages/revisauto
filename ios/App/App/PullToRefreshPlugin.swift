import Capacitor

@objc(PullToRefreshPlugin)
public class PullToRefreshPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    public let identifier = "PullToRefreshPlugin"
    public let jsName = "PullToRefresh"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "beginRefresh", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endRefresh", returnType: CAPPluginReturnPromise)
    ]

    private weak var controller: AppViewController?

    override public init() {
        super.init()
    }

    init(controller: AppViewController) {
        self.controller = controller
        super.init()
    }

    @objc func beginRefresh(_ call: CAPPluginCall) {
        controller?.beginPullToRefresh()
        call.resolve()
    }

    @objc func endRefresh(_ call: CAPPluginCall) {
        controller?.endPullToRefresh()
        call.resolve()
    }

    func notifyRefreshRequested() {
        notifyListeners("refreshRequested", data: [:], retainUntilConsumed: true)
    }
}
