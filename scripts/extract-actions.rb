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
