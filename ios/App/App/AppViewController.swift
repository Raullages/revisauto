import Capacitor
import UIKit

class AppViewController: CAPBridgeViewController {
    private lazy var pullToRefreshPlugin = PullToRefreshPlugin(controller: self)
    private var refreshControl: UIRefreshControl?
    private var refreshTimeoutWorkItem: DispatchWorkItem?

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(pullToRefreshPlugin)
        setupPullToRefresh()
    }

    private func setupPullToRefresh() {
        guard let scrollView = webView?.scrollView else {
            return
        }

        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(handlePullToRefresh), for: .valueChanged)
        scrollView.refreshControl = refreshControl
        self.refreshControl = refreshControl
    }

    @objc private func handlePullToRefresh() {
        refreshTimeoutWorkItem?.cancel()

        let timeoutWorkItem = DispatchWorkItem { [weak self] in
            self?.endPullToRefresh()
        }

        refreshTimeoutWorkItem = timeoutWorkItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 10, execute: timeoutWorkItem)
        pullToRefreshPlugin.notifyRefreshRequested()
    }

    func endPullToRefresh() {
        refreshTimeoutWorkItem?.cancel()
        refreshTimeoutWorkItem = nil

        DispatchQueue.main.async { [weak self] in
            self?.refreshControl?.endRefreshing()
        }
    }

    func beginPullToRefresh() {
        refreshTimeoutWorkItem?.cancel()

        let timeoutWorkItem = DispatchWorkItem { [weak self] in
            self?.endPullToRefresh()
        }

        refreshTimeoutWorkItem = timeoutWorkItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 10, execute: timeoutWorkItem)

        DispatchQueue.main.async { [weak self] in
            guard let self, let refreshControl = self.refreshControl, let scrollView = self.webView?.scrollView else {
                return
            }

            if !refreshControl.isRefreshing {
                refreshControl.beginRefreshing()
            }

            let targetOffset = CGPoint(x: 0, y: -scrollView.adjustedContentInset.top - refreshControl.frame.height)
            scrollView.setContentOffset(targetOffset, animated: true)
        }
    }
}
