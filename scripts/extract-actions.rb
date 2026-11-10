#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fastlane'
require 'fastlane/documentation/actions_list'
require 'json'
require 'fileutils'
require 'time'

puts "==> Loading Fastlane actions from gem (v#{Fastlane::VERSION})..."
Fastlane.load_actions

# Platform Virtualization for Documentation Generator:
# Fastlane action implementations (such as capture_ios_screenshots, snapshot, match)
# gate options behind `Helper.mac?` or `xcode_at_least?`. Because this documentation
# generator documents all platforms for mobile developers worldwide, we virtualize
# macOS and Xcode environment queries so that 100% of parameters are extracted,
# even when this script executes on a Linux host (e.g. GitHub Actions ubuntu-latest).
require 'open3'
module Open3
  class << self
    alias_method :original_capture3, :capture3 unless method_defined?(:original_capture3)
    def capture3(*cmd, **opts)
      cmd_str = cmd.join(' ')
      if cmd_str.include?('xcodebuild') || cmd_str.include?('xcode-select') || cmd_str.include?('xcrun')
        return ["Xcode 16.0\nBuild version 16A242d\niOS 18.0 (22A3351)", "", Struct.new(:success?).new(true)]
      end
      original_capture3(*cmd, **opts)
    rescue Errno::ENOENT => e
      ["", e.message, Struct.new(:success?).new(false)]
    end
  end
end

class SpecHelper; end
ENV['SNAPSHOT_IOS_VERSION'] ||= '18.0'

module FastlaneCore
  module Helper
    def self.mac?
      true
    end

    def self.is_mac?
      true
    end

    def self.xcode_at_least?(_version = nil)
      true
    end

    def self.xcode_available?
      true
    end

    def self.test?
      true
    end

    def self.is_test?
      true
    end
  end
end

extracted_actions = []

Fastlane::ActionsList.all_actions do |action, name|
  next unless action < Fastlane::Action

  action_name = begin
    action.action_name
  rescue StandardError
    name.to_s
  end

  # Check deprecation
  is_deprecated = begin
    Fastlane::Actions.is_deprecated?(action)
  rescue StandardError
    false
  end

  # Extract options safely
  options = []
  if action.available_options.is_a?(Array)
    action.available_options.each do |opt|
      next unless opt.is_a?(FastlaneCore::ConfigItem)

      options << {
        key: opt.key.to_s,
        env_name: opt.env_name.to_s,
        description: opt.description.to_s,
        data_type: opt.data_type ? opt.data_type.to_s : (opt.is_string ? "String" : nil),
        default_value: opt.default_value.nil? ? nil : opt.default_value.to_s,
        optional: opt.optional ? true : false,
        sensitive: opt.sensitive ? true : false,
        conflicting_options: opt.conflicting_options&.map(&:to_s)
      }
    end
  end

  # Extract output shared values
  output_values = []
  if action.output.is_a?(Array)
    action.output.each do |item|
      if item.is_a?(Array) && item.size >= 2
        output_values << {
          key: item[0].to_s,
          description: item[1].to_s
        }
      end
    end
  end

  # Extract supported platforms
  platforms = [:ios, :android, :mac].select do |p|
    begin
      action.is_supported?(p)
    rescue StandardError
      false
    end
  end

  # Extract example code
  examples = []
  if action.example_code.is_a?(Array)
    examples = action.example_code.map(&:to_s)
  elsif action.example_code.is_a?(String)
    examples = [action.example_code]
  end

  # Source filename
  source_file = nil
  begin
    methods = action.methods(false).map { |m| action.method(m) }
    locations = methods.map(&:source_location).compact.map(&:first).uniq
    if locations.any?
      source_file = File.basename(locations.first)
    end
  rescue StandardError
    source_file = "#{action_name}.rb"
  end

  action_aliases = begin
    action.aliases.map(&:to_s)
  rescue StandardError
    []
  end

  extracted_actions << {
    name: action_name,
    category: action.category ? action.category.to_s : "misc",
    description: action.description.to_s,
    details: action.details.to_s,
    authors: Array(action.author || action.authors).map(&:to_s),
    platforms: platforms.map(&:to_s),
    options: options,
    output: output_values,
    return_value: action.return_value.to_s,
    return_type: action.return_type.to_s,
    examples: examples,
    aliases: action_aliases,
    is_deprecated: is_deprecated,
    source_file: source_file,
    source_url: source_file ? "https://github.com/fastlane/fastlane/blob/master/fastlane/lib/fastlane/actions/#{source_file}" : nil
  }
end

# Sort actions alphabetically
extracted_actions.sort_by! { |a| a[:name] }

# Prepare target directories
data_dir = File.expand_path('../src/data', __dir__)
FileUtils.mkdir_p(data_dir)

# Save fastlane-actions.json
actions_json_path = File.join(data_dir, 'fastlane-actions.json')
File.write(actions_json_path, JSON.pretty_generate(extracted_actions))
puts "==> Successfully wrote #{extracted_actions.size} actions to #{actions_json_path}"

# Save fastlane-version.json
version_json_path = File.join(data_dir, 'fastlane-version.json')
fastlane_spec = begin
  Gem::Specification.find_by_name('fastlane')
rescue StandardError
  nil
end

min_ruby = fastlane_spec ? fastlane_spec.required_ruby_version.to_s : '>= 3.2.0'

version_info = {
  fastlane_version: Fastlane::VERSION,
  min_ruby_version: min_ruby,
  recommended_ruby_version: ">= 3.3.0",
  extracted_at: Time.now.utc.iso8601,
  total_actions: extracted_actions.size,
  active_actions: extracted_actions.count { |a| !a[:is_deprecated] },
  deprecated_actions: extracted_actions.count { |a| a[:is_deprecated] },
  upstream_repo: "https://github.com/fastlane/fastlane",
  rubygems_url: "https://rubygems.org/gems/fastlane"
}
File.write(version_json_path, JSON.pretty_generate(version_info))
puts "==> Wrote version info to #{version_json_path}"

# ==============================================================================
# Spaceship Bundle ID Capabilities Extractor & Sync Generator
# ==============================================================================
if defined?(Spaceship::ConnectAPI::BundleIdCapability::Type)
  puts "==> Extracting Spaceship Bundle ID Capabilities from gem..."

  CAPABILITY_METADATA = {
    "ACCESS_WIFI_INFORMATION" => { description: "Access Wi-Fi Information & Network Extension Wi-Fi info", settings: "None" },
    "APP_ATTEST" => { description: "DeviceCheck & App Attest fraud protection", settings: "None" },
    "APP_GROUPS" => { description: "Shared data storage between App & App Extensions", settings: "Linked Group Identifiers" },
    "APPLE_ID_AUTH" => { description: "Sign in with Apple authentication", settings: "`APPLE_ID_AUTH_APP_CONSENT` (`PRIMARY_APP_CONSENT`)" },
    "APPLE_PAY" => { description: "Apple Pay Merchant payment processing", settings: "Linked Merchant Identifiers" },
    "ASSOCIATED_DOMAINS" => { description: "Universal Links, App Clips, & Shared Web Credentials", settings: "Configured via `.entitlements`" },
    "AUTOFILL_CREDENTIAL_PROVIDER" => { description: "Password manager credential provider extensions", settings: "None" },
    "CARPLAY_MESSAGING" => { description: "CarPlay messaging readout & Siri compose", settings: "Apple Special Approval Required" },
    "CARPLAY_NAVIGATION" => { description: "CarPlay turn-by-turn navigation & maps", settings: "Apple Special Approval Required" },
    "CARPLAY_PLAYABLE_CONTENT" => { description: "CarPlay audio streaming & playable content", settings: "Apple Special Approval Required" },
    "CARPLAY_VOIP" => { description: "CarPlay telephony & VoIP call routing", settings: "Apple Special Approval Required" },
    "CLASSKIT" => { description: "ClassKit student progress recording", settings: "None" },
    "COREMEDIA_HLS_LOW_LATENCY" => { description: "Low-latency HLS video broadcasting", settings: "None" },
    "CRITICAL_ALERTS" => { description: "Bypasses Do Not Disturb / Mute hardware switch", settings: "Apple Special Approval Required" },
    "DATA_PROTECTION" => { description: "Complete / Protected filesystem encryption", settings: "`DATA_PROTECTION_PERMISSION_LEVEL`" },
    "DECLARED_AGE_RANGE" => { description: "Declared Age Range verification (App Store Connect compliance)", settings: "None" },
    "DRIVERKIT" => { description: "DriverKit user-space hardware driver execution", settings: "Apple Special Approval Required" },
    "DRIVERKIT_ENDPOINT_SECURITY" => { description: "Endpoint Security client extension driver", settings: "Apple Special Approval Required" },
    "DRIVERKIT_HID" => { description: "Human Interface Device (HID) driver", settings: "Apple Special Approval Required" },
    "DRIVERKIT_HID_DEVICE" => { description: "HID USB/PCIe hardware device access", settings: "Apple Special Approval Required" },
    "DRIVERKIT_HID_EVENT_SERVICE" => { description: "HID Event Service custom event dispatch", settings: "Apple Special Approval Required" },
    "DRIVERKIT_NETWORKING" => { description: "Network interface Ethernet driver", settings: "Apple Special Approval Required" },
    "DRIVERKIT_SERIAL" => { description: "Serial / USB-UART communications driver", settings: "Apple Special Approval Required" },
    "EXTENDED_VIRTUAL_ADDRESSING" => { description: "Increased 64-bit virtual memory address space", settings: "None" },
    "FAMILY_CONTROLS" => { description: "Screen Time API parental & usage controls", settings: "Apple Special Approval Required" },
    "FILEPROVIDER_TESTINGMODE" => { description: "Cloud FileProvider framework testing mode", settings: "None" },
    "FONT_INSTALLATION" => { description: "Dynamic system font provider extensions", settings: "None" },
    "GAME_CENTER" => { description: "Apple Game Center achievements & leaderboards", settings: "`GAME_CENTER_SETTING`" },
    "GROUP_ACTIVITIES" => { description: "SharePlay synchronized group experiences", settings: "None" },
    "HEALTHKIT" => { description: "HealthKit health & clinical record access", settings: "None" },
    "HEALTHKIT_RECALIBRATE_ESTIMATES" => { description: "HealthKit custom baseline recalibration", settings: "Apple Special Approval Required" },
    "HLS_INTERSTITIAL_PREVIEW" => { description: "HLS video stream interstitial ad preview", settings: "None" },
    "HOMEKIT" => { description: "HomeKit connected smart home accessories", settings: "None" },
    "HOTSPOT_HELPER_MANAGED" => { description: "MDM-managed Hotspot Helper Wi-Fi configuration", settings: "Apple Special Approval Required" },
    "HOT_SPOT" => { description: "Hotspot Helper Wi-Fi network configuration", settings: "None" },
    "ICLOUD" => { description: "iCloud Key-Value Storage & CloudKit database", settings: "`ICLOUD_VERSION`" },
    "INTER_APP_AUDIO" => { description: "Legacy Inter-App Audio routing", settings: "None" },
    "IN_APP_PURCHASE" => { description: "StoreKit In-App Purchases & Subscriptions", settings: "None" },
    "IPAD_CAMERA_MULTITASKING" => { description: "iPad Multitasking Camera access while in Split View", settings: "None" },
    "MAPS" => { description: "Turn-by-turn routing app coverage document", settings: "None" },
    "MARZIPAN" => { description: "Mac Catalyst cross-platform app porting", settings: "None" },
    "MDM_MANAGED_ASSOCIATED_DOMAINS" => { description: "MDM-managed Associated Domains & Enterprise Universal Links", settings: "None" },
    "MULTIPATH" => { description: "Multipath TCP (MPTCP) network failover", settings: "None" },
    "MUSIC_KIT" => { description: "Apple Music catalog & personal subscriber library", settings: "None" },
    "NETWORK_CUSTOM_PROTOCOL" => { description: "Custom network packet tunneling protocol", settings: "None" },
    "NETWORK_EXTENSIONS" => { description: "Packet tunnels, DNS proxies, and content filters", settings: "None" },
    "NFC_TAG_READING" => { description: "CoreNFC Tag Reading & Writing", settings: "None" },
    "PERSONAL_VPN" => { description: "NEVPNManager personal VPN tunnels", settings: "None" },
    "PUSH_NOTIFICATIONS" => { description: "Apple Push Notification service (APNs)", settings: "None (default)" },
    "SFUNIVERSALLINK_API" => { description: "Safari Universal Link programmatic verification", settings: "None" },
    "SHAZAM_KIT" => { description: "Audio fingerprinting & song recognition", settings: "None" },
    "SIRIKIT" => { description: "Siri voice shortcuts & custom intents", settings: "None" },
    "SYSTEM_EXTENSION_INSTALL" => { description: "macOS / DriverKit daemon install entitlement", settings: "None" },
    "USER_MANAGEMENT" => { description: "Multi-user Apple School Manager support", settings: "None" },
    "USERNOTIFICATIONS_COMMUNICATION" => { description: "Communication & VoIP call notifications", settings: "None" },
    "USERNOTIFICATIONS_TIMESENSITIVE" => { description: "Time-sensitive break-through notifications", settings: "None" },
    "VP9_DECODER" => { description: "Hardware-accelerated VP9 video decoding", settings: "None" },
    "WALLET" => { description: "PassKit digital wallet passes & loyalty cards", settings: "Linked Pass Type Identifiers" },
    "WIRELESS_ACCESSORY_CONFIGURATION" => { description: "MFi wireless accessory configuration (WAC)", settings: "None" }
  }

  raw_types = Spaceship::ConnectAPI::BundleIdCapability::Type.constants.map(&:to_s).sort
  capabilities_data = raw_types.map do |const_name|
    meta = CAPABILITY_METADATA[const_name] || {
      description: const_name.split('_').map(&:capitalize).join(' ') + " (Auto-detected from Upstream)",
      settings: "None / Refer to Apple Developer documentation"
    }
    {
      constant: const_name,
      value: Spaceship::ConnectAPI::BundleIdCapability::Type.const_get(const_name),
      description: meta[:description],
      settings: meta[:settings]
    }
  end

  # 1. Save data to src/data/spaceship-capabilities.json
  capabilities_json_path = File.join(data_dir, 'spaceship-capabilities.json')
  payload = {
    fastlane_version: Fastlane::VERSION,
    extracted_at: Time.now.utc.iso8601,
    total_capabilities: capabilities_data.size,
    capabilities: capabilities_data
  }
  File.write(capabilities_json_path, JSON.pretty_generate(payload))
  puts "==> Wrote #{capabilities_data.size} Spaceship capabilities to #{capabilities_json_path}"

  # 2. Synchronize Markdown table in spaceship-bundle-id-capabilities.mdx
  recipe_mdx_path = File.expand_path('../src/content/docs/recipes/spaceship-bundle-id-capabilities.mdx', __dir__)
  if File.exist?(recipe_mdx_path)
    mdx_content = File.read(recipe_mdx_path)
    start_tag = "{/* AUTO-GENERATED-SPACESHIP-CAPABILITIES-START */}"
    end_tag = "{/* AUTO-GENERATED-SPACESHIP-CAPABILITIES-END */}"

    if mdx_content.include?(start_tag) && mdx_content.include?(end_tag)
      table_rows = capabilities_data.map do |cap|
        "| `#{cap[:constant]}` | #{cap[:description]} | #{cap[:settings]} |"
      end

      generated_table = [
        "| Type Constant (`Spaceship::ConnectAPI::BundleIdCapability::Type::*`) | Apple Entitlement Description | Supported Settings |",
        "|:---|:---|:---|",
        table_rows.join("\n")
      ].join("\n")

      replacement = "#{start_tag}\n#{generated_table}\n#{end_tag}"
      updated_mdx = mdx_content.gsub(/#{Regexp.escape(start_tag)}[\s\S]*?#{Regexp.escape(end_tag)}/, replacement)

      File.write(recipe_mdx_path, updated_mdx)
      puts "==> Successfully synchronized #{capabilities_data.size} capabilities to #{recipe_mdx_path}"
    end
  end
end
